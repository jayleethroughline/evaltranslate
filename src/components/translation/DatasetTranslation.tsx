import { useState } from 'react';
import { Play } from 'lucide-react';
import { useDatasets } from '@/hooks/useDatasets';
import { useTranslation } from '@/hooks/useTranslation';
import { DatasetSelector } from '@/components/dataset/DatasetSelector';
import { LanguageSelector } from '@/components/translation/LanguageSelector';
import { AgentPromptEditor } from '@/components/translation/AgentPromptEditor';
import { TranslationProgress } from '@/components/translation/TranslationProgress';
import { TranslationResultsViewer } from '@/components/translation/TranslationResultsViewer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_PROMPTS } from '@/lib/constants';

export function DatasetTranslation() {
  const { datasets, uploadDataset, deleteDataset, loading: datasetsLoading } = useDatasets();
  const {
    jobs,
    selectedJobId,
    selectJob,
    createJob,
    startJob,
    cancelJob,
    deleteJob,
    saveAsDataset
  } = useTranslation();

  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [agentPrompts, setAgentPrompts] = useState(DEFAULT_PROMPTS);
  const [isStarting, setIsStarting] = useState(false);

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId) || null;
  const selectedJob = jobs.find(j => j.id === selectedJobId) || null;

  const handleStartTranslation = async () => {
    if (!selectedDatasetId || !targetLanguage) {
      return;
    }

    setIsStarting(true);
    try {
      const job = await createJob(
        selectedDatasetId,
        targetLanguage,
        customPrompt || undefined,
        agentPrompts
      );
      await startJob(job.id);
    } catch (error) {
      console.error('Error starting translation:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const estimateCost = () => {
    if (!selectedDataset || !targetLanguage) return null;

    const rowCount = selectedDataset.metadata.rowCount;
    const callsPerRow = 4; // Forward, Evaluator, Backward, Comparator
    const totalCalls = rowCount * callsPerRow;

    // Rough estimate: assume 500 tokens per call (input + output)
    const tokensPerCall = 500;
    const totalTokens = totalCalls * tokensPerCall;

    // Gemini Pro pricing (example): $0.0005 per 1K tokens input, $0.0015 per 1K tokens output
    // Average: $0.001 per 1K tokens
    const estimatedCost = (totalTokens / 1000) * 0.001;

    return {
      rowCount,
      totalCalls,
      estimatedCost: estimatedCost.toFixed(2),
      estimatedTime: `~${Math.ceil(rowCount * 2.5)} seconds` // 2.5s per row (4 calls * 500ms + processing)
    };
  };

  const costEstimate = estimateCost();

  // If viewing results, show results viewer
  if (selectedJob) {
    return (
      <TranslationResultsViewer
        job={selectedJob}
        onBack={() => selectJob(null)}
      />
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Configuration Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Translation Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DatasetSelector
              datasets={datasets}
              selectedDataset={selectedDataset}
              onSelect={setSelectedDatasetId}
              onUpload={uploadDataset}
              onDelete={deleteDataset}
              loading={datasetsLoading}
            />

            <LanguageSelector
              value={targetLanguage}
              onChange={setTargetLanguage}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Instructions (Optional)</label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add any specific instructions for the translation (e.g., 'Use formal tone', 'Keep technical terms in English')..."
                className="min-h-[100px]"
              />
            </div>

            <AgentPromptEditor
              prompts={agentPrompts}
              onChange={setAgentPrompts}
            />

            {costEstimate && (
              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <div className="text-sm space-y-1">
                    <div className="font-medium mb-2">Estimate</div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rows:</span>
                      <span>{costEstimate.rowCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API Calls:</span>
                      <span>{costEstimate.totalCalls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Cost:</span>
                      <span>${costEstimate.estimatedCost}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Note: This is a rough estimate based on Gemini pricing
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={handleStartTranslation}
              disabled={!selectedDatasetId || !targetLanguage || isStarting}
              className="w-full"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              {isStarting ? 'Starting...' : 'Start Translation'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress Panel */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Translation Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <TranslationProgress
              jobs={jobs}
              onCancel={cancelJob}
              onDelete={deleteJob}
              onViewResults={selectJob}
              onSaveAsDataset={saveAsDataset}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
