import { TranslationJob, Dataset, TranslationConfig } from '@/types';
import { storageManager } from '@/lib/storage/LocalStorageManager';
import { datasetService } from '@/lib/services/DatasetService';
import { TranslationEngine } from '@/lib/services/TranslationEngine';
import { DEFAULT_PROMPTS } from '@/lib/constants';

export class TranslationService {
  private activeJobs: Map<string, AbortController> = new Map();

  async createJob(
    datasetId: string,
    targetLanguage: string,
    customPrompt?: string,
    agentPrompts?: Partial<TranslationConfig['prompts']>
  ): Promise<TranslationJob> {
    const dataset = datasetService.getDataset(datasetId);

    if (!dataset) {
      throw new Error('Dataset not found');
    }

    if (dataset.data.length === 0) {
      throw new Error('Dataset is empty');
    }

    const id = `job-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const job: TranslationJob = {
      id,
      sourceDatasetId: datasetId,
      sourceDatasetName: dataset.name,
      targetLanguage,
      customPrompt,
      agentPrompts: {
        forwardTranslator: agentPrompts?.forwardTranslator || DEFAULT_PROMPTS.forwardTranslator,
        evaluator: agentPrompts?.evaluator || DEFAULT_PROMPTS.evaluator,
        backwardTranslator: agentPrompts?.backwardTranslator || DEFAULT_PROMPTS.backwardTranslator,
        comparator: agentPrompts?.comparator || DEFAULT_PROMPTS.comparator
      },
      status: 'pending',
      progress: {
        current: 0,
        total: dataset.data.length
      },
      results: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageManager.saveJob(job);
    return job;
  }

  async startJob(jobId: string): Promise<void> {
    const job = storageManager.getJob(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status === 'in_progress') {
      throw new Error('Job is already running');
    }

    const apiKey = storageManager.getApiKey();
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const dataset = datasetService.getDataset(job.sourceDatasetId);
    if (!dataset) {
      throw new Error('Source dataset not found');
    }

    // Find the prompt column (first column with type 'prompt' or first text column)
    const promptColumn = dataset.columns.find(col => col.type === 'prompt') ||
                        dataset.columns.find(col => col.type === 'text') ||
                        dataset.columns[0];

    if (!promptColumn) {
      throw new Error('No text column found in dataset');
    }

    const abortController = new AbortController();
    this.activeJobs.set(jobId, abortController);

    // Update job status
    storageManager.updateJob(jobId, {
      status: 'in_progress',
      progress: {
        ...job.progress,
        startTime: new Date().toISOString()
      }
    });

    // Start translation in background
    this.processTranslation(jobId, dataset, promptColumn.name, apiKey, abortController.signal)
      .catch(error => {
        console.error('Translation job error:', error);
        storageManager.updateJob(jobId, {
          status: 'failed',
          error: error.message,
          progress: {
            ...job.progress,
            endTime: new Date().toISOString()
          }
        });
      })
      .finally(() => {
        this.activeJobs.delete(jobId);
      });
  }

  private async processTranslation(
    jobId: string,
    dataset: Dataset,
    promptColumnName: string,
    apiKey: string,
    signal: AbortSignal
  ): Promise<void> {
    const job = storageManager.getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const engine = new TranslationEngine(apiKey);
    const config: TranslationConfig = {
      targetLanguage: job.targetLanguage,
      customPrompt: job.customPrompt,
      prompts: job.agentPrompts
    };

    const results = [];

    for (let i = 0; i < dataset.data.length; i++) {
      // Check if cancelled
      if (signal.aborted) {
        storageManager.updateJob(jobId, {
          status: 'cancelled',
          progress: {
            ...job.progress,
            current: i,
            endTime: new Date().toISOString()
          },
          results
        });
        return;
      }

      const row = dataset.data[i];
      const originalText = String(row[promptColumnName] || '');

      console.log(`[TranslationService] Processing row ${i + 1}/${dataset.data.length}`);

      try {
        const result = await engine.translateRow(originalText, config);
        result.rowIndex = i;
        results.push(result);

        console.log(`[TranslationService] Row ${i + 1} completed successfully`);

        // Update progress
        storageManager.updateJob(jobId, {
          progress: {
            ...job.progress,
            current: i + 1
          },
          results: [...results]
        });

        console.log(`[TranslationService] Progress updated: ${i + 1}/${dataset.data.length}`);
      } catch (error) {
        // Log error but continue with other rows
        console.error(`Error translating row ${i}:`, error);

        // Add error result
        results.push({
          rowIndex: i,
          originalText,
          translatedText: 'ERROR',
          forwardQualityScore: 0,
          evaluatorFeedback: error instanceof Error ? error.message : 'Unknown error',
          backTranslation: '',
          finalQualityScore: 0,
          comparatorFeedback: '',
          recommendation: 'REVISE' as const
        });

        storageManager.updateJob(jobId, {
          progress: {
            ...job.progress,
            current: i + 1
          },
          results: [...results]
        });
      }
    }

    // Mark as completed
    storageManager.updateJob(jobId, {
      status: 'completed',
      progress: {
        ...job.progress,
        current: dataset.data.length,
        endTime: new Date().toISOString()
      },
      results
    });
  }

  cancelJob(jobId: string): void {
    const abortController = this.activeJobs.get(jobId);
    if (abortController) {
      abortController.abort();
      this.activeJobs.delete(jobId);
    }
  }

  deleteJob(jobId: string): void {
    this.cancelJob(jobId);
    storageManager.deleteJob(jobId);
  }

  getJob(jobId: string): TranslationJob | null {
    return storageManager.getJob(jobId);
  }

  getAllJobs(): TranslationJob[] {
    return storageManager.getAllJobs();
  }

  async saveJobAsDataset(jobId: string, name: string): Promise<Dataset> {
    const job = storageManager.getJob(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'completed') {
      throw new Error('Job is not completed');
    }

    const sourceDataset = datasetService.getDataset(job.sourceDatasetId);
    if (!sourceDataset) {
      throw new Error('Source dataset not found');
    }

    // Find the prompt column
    const promptColumn = sourceDataset.columns.find(col => col.type === 'prompt') ||
                        sourceDataset.columns.find(col => col.type === 'text') ||
                        sourceDataset.columns[0];

    if (!promptColumn) {
      throw new Error('No text column found in source dataset');
    }

    // Create new dataset with translations
    const newData = job.results.map((result, idx) => {
      const originalRow = sourceDataset.data[idx];
      return {
        ...originalRow,
        [`${promptColumn.name}_translated`]: result.translatedText,
        forward_quality_score: result.forwardQualityScore,
        back_translation: result.backTranslation,
        final_quality_score: result.finalQualityScore,
        recommendation: result.recommendation
      };
    });

    const newDataset: Dataset = {
      id: `dataset-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: name || `${job.sourceDatasetName} - ${job.targetLanguage}`,
      columns: [
        ...sourceDataset.columns,
        { name: `${promptColumn.name}_translated`, type: 'text' },
        { name: 'forward_quality_score', type: 'text' },
        { name: 'back_translation', type: 'text' },
        { name: 'final_quality_score', type: 'text' },
        { name: 'recommendation', type: 'text' }
      ],
      data: newData,
      metadata: {
        rowCount: newData.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceType: 'translation',
        sourceJobId: jobId
      }
    };

    storageManager.saveDataset(newDataset);

    // Update job with output dataset ID
    storageManager.updateJob(jobId, {
      outputDatasetId: newDataset.id
    });

    return newDataset;
  }
}

export const translationService = new TranslationService();
