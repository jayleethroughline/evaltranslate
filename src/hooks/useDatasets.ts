import { useState, useCallback, useEffect } from 'react';
import { Dataset } from '@/types';
import { datasetService } from '@/lib/services/DatasetService';
import { useToast } from '@/hooks/use-toast';

export function useDatasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadDatasets = useCallback(() => {
    try {
      const allDatasets = datasetService.getAllDatasets();
      setDatasets(allDatasets);
    } catch (error) {
      console.error('Error loading datasets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load datasets',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const uploadDataset = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const dataset = await datasetService.uploadDataset(file);
      loadDatasets();
      toast({
        title: 'Success',
        description: `Dataset "${dataset.name}" uploaded successfully`
      });
      return dataset;
    } catch (error) {
      console.error('Error uploading dataset:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload dataset',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadDatasets, toast]);

  const deleteDataset = useCallback((id: string) => {
    try {
      datasetService.deleteDataset(id);
      loadDatasets();
      toast({
        title: 'Success',
        description: 'Dataset deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete dataset',
        variant: 'destructive'
      });
    }
  }, [loadDatasets, toast]);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  return {
    datasets,
    loading,
    uploadDataset,
    deleteDataset,
    refreshDatasets: loadDatasets
  };
}
