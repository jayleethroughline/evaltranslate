import { useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { Dataset } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DatasetSelectorProps {
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  onSelect: (datasetId: string) => void;
  onUpload: (file: File) => Promise<any>;
  onDelete: (datasetId: string) => void;
  loading?: boolean;
}

export function DatasetSelector({
  datasets,
  selectedDataset,
  onSelect,
  onUpload,
  onDelete,
  loading = false
}: DatasetSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload CSV
        </Button>
      </div>

      {datasets.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Dataset</label>
          <div className="flex gap-2">
            <Select
              value={selectedDataset?.id || ''}
              onValueChange={onSelect}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a dataset..." />
              </SelectTrigger>
              <SelectContent>
                {datasets.map(dataset => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    {dataset.name} ({dataset.metadata.rowCount} rows)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedDataset && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{selectedDataset.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(selectedDataset.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      )}

      {selectedDataset && (
        <div className="p-4 bg-muted rounded-lg space-y-1">
          <div className="text-sm font-medium">{selectedDataset.name}</div>
          <div className="text-xs text-muted-foreground">
            {selectedDataset.metadata.rowCount} rows • {selectedDataset.columns.length} columns
          </div>
          {selectedDataset.description && (
            <div className="text-xs text-muted-foreground mt-2">
              {selectedDataset.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
