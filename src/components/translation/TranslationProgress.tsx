import { Clock, XCircle, Trash2, Eye, Save } from 'lucide-react';
import { TranslationJob } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface TranslationProgressProps {
  jobs: TranslationJob[];
  onCancel: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  onViewResults: (jobId: string) => void;
  onSaveAsDataset: (jobId: string, name: string) => Promise<any>;
}

export function TranslationProgress({
  jobs,
  onCancel,
  onDelete,
  onViewResults,
  onSaveAsDataset
}: TranslationProgressProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [datasetName, setDatasetName] = useState('');

  const getStatusColor = (status: TranslationJob['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: TranslationJob['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return null;

    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const durationMs = end - start;

    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleSaveClick = (job: TranslationJob) => {
    setSelectedJobId(job.id);
    setDatasetName(`${job.sourceDatasetName} - ${job.targetLanguage}`);
    setSaveDialogOpen(true);
  };

  const handleSave = async () => {
    if (selectedJobId && datasetName) {
      await onSaveAsDataset(selectedJobId, datasetName);
      setSaveDialogOpen(false);
      setSelectedJobId(null);
      setDatasetName('');
    }
  };

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No translation jobs yet. Start a translation to see progress here.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map(job => {
        const progressPercent = job.progress.total > 0
          ? (job.progress.current / job.progress.total) * 100
          : 0;

        return (
          <Card key={job.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    {job.sourceDatasetName} → {job.targetLanguage}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded ${getStatusColor(job.status)}`}>
                      {getStatusText(job.status)}
                    </span>
                    {job.progress.startTime && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(job.progress.startTime, job.progress.endTime)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {job.status === 'in_progress' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCancel(job.id)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                  {job.status === 'completed' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewResults(job.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveClick(job)}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this translation job? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(job.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {job.progress.current} / {job.progress.total} rows
                </span>
                <span className="font-medium">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} />
              {job.error && (
                <div className="text-xs text-red-500 mt-2">
                  Error: {job.error}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Dataset</DialogTitle>
            <DialogDescription>
              Enter a name for the translated dataset
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Dataset Name</label>
            <input
              type="text"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter dataset name..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!datasetName}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
