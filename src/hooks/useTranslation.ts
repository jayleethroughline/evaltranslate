import { useState, useCallback, useEffect } from 'react';
import { TranslationJob, TranslationConfig } from '@/types';
import { translationService } from '@/lib/services/TranslationService';
import { useToast } from '@/hooks/use-toast';

export function useTranslation() {
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadJobs = useCallback(() => {
    try {
      const allJobs = translationService.getAllJobs();
      // Sort by created date desc (newest first)
      allJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setJobs(allJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  }, []);

  const createJob = useCallback(async (
    datasetId: string,
    targetLanguage: string,
    customPrompt?: string,
    agentPrompts?: Partial<TranslationConfig['prompts']>
  ) => {
    try {
      const job = await translationService.createJob(
        datasetId,
        targetLanguage,
        customPrompt,
        agentPrompts
      );
      loadJobs();
      return job;
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create translation job',
        variant: 'destructive'
      });
      throw error;
    }
  }, [loadJobs, toast]);

  const startJob = useCallback(async (jobId: string) => {
    try {
      await translationService.startJob(jobId);
      loadJobs();
      toast({
        title: 'Translation Started',
        description: 'Your translation job has been started'
      });
    } catch (error) {
      console.error('Error starting job:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start translation job',
        variant: 'destructive'
      });
      throw error;
    }
  }, [loadJobs, toast]);

  const cancelJob = useCallback((jobId: string) => {
    try {
      translationService.cancelJob(jobId);
      loadJobs();
      toast({
        title: 'Job Cancelled',
        description: 'Translation job has been cancelled'
      });
    } catch (error) {
      console.error('Error cancelling job:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel job',
        variant: 'destructive'
      });
    }
  }, [loadJobs, toast]);

  const deleteJob = useCallback((jobId: string) => {
    try {
      translationService.deleteJob(jobId);
      loadJobs();
      toast({
        title: 'Job Deleted',
        description: 'Translation job has been deleted'
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete job',
        variant: 'destructive'
      });
    }
  }, [loadJobs, toast]);

  const saveAsDataset = useCallback(async (jobId: string, name: string) => {
    try {
      const dataset = await translationService.saveJobAsDataset(jobId, name);
      loadJobs();
      toast({
        title: 'Success',
        description: `Dataset "${dataset.name}" created successfully`
      });
      return dataset;
    } catch (error) {
      console.error('Error saving as dataset:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save as dataset',
        variant: 'destructive'
      });
      throw error;
    }
  }, [loadJobs, toast]);

  // Auto-refresh when jobs are running
  useEffect(() => {
    const hasRunning = jobs.some(j => j.status === 'in_progress');
    if (hasRunning) {
      const interval = setInterval(loadJobs, 2000);
      return () => clearInterval(interval);
    }
  }, [jobs, loadJobs]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return {
    jobs,
    selectedJobId,
    selectJob: setSelectedJobId,
    createJob,
    startJob,
    cancelJob,
    deleteJob,
    saveAsDataset,
    refreshJobs: loadJobs
  };
}
