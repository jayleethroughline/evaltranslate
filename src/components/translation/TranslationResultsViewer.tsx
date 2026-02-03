import { useState } from 'react';
import { ArrowLeft, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { TranslationJob } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { datasetService } from '@/lib/services/DatasetService';

interface TranslationResultsViewerProps {
  job: TranslationJob;
  onBack: () => void;
}

export function TranslationResultsViewer({ job, onBack }: TranslationResultsViewerProps) {
  const [filter, setFilter] = useState<'all' | 'ACCEPT' | 'REVISE'>('all');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 50;

  const filteredResults = filter === 'all'
    ? job.results
    : job.results.filter(r => r.recommendation === filter);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const toggleRow = (rowIndex: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowIndex)) {
      newExpanded.delete(rowIndex);
    } else {
      newExpanded.add(rowIndex);
    }
    setExpandedRows(newExpanded);
  };

  const handleExport = () => {
    // Load source dataset to get category and risk_level
    const sourceDataset = datasetService.getDataset(job.sourceDatasetId);

    if (!sourceDataset) {
      console.error('Source dataset not found');
      return;
    }

    // Create 3-column export: translated_prompt, category, risk_level
    const data = job.results.map(result => {
      const sourceRow = sourceDataset.data[result.rowIndex];

      return {
        prompt: result.translatedText,
        category: sourceRow?.category || sourceRow?.risk_category || '',
        risk_level: sourceRow?.risk_level || sourceRow?.severity_level || sourceRow?.severity || ''
      };
    });

    const dataset = {
      id: 'temp',
      name: `${job.sourceDatasetName} - ${job.targetLanguage}`,
      columns: [
        { name: 'prompt', type: 'prompt' as const },
        { name: 'category', type: 'text' as const },
        { name: 'risk_level', type: 'text' as const }
      ],
      data,
      metadata: {
        rowCount: data.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    const blob = datasetService.exportToCSV(dataset);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${job.sourceDatasetName}-${job.targetLanguage}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const acceptCount = job.results.filter(r => r.recommendation === 'ACCEPT').length;
  const reviseCount = job.results.filter(r => r.recommendation === 'REVISE').length;
  const avgForwardScore = job.results.length > 0
    ? job.results.reduce((sum, r) => sum + r.forwardQualityScore, 0) / job.results.length
    : 0;
  const avgFinalScore = job.results.length > 0
    ? job.results.reduce((sum, r) => sum + r.finalQualityScore, 0) / job.results.length
    : 0;

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Translation Results: {job.sourceDatasetName} → {job.targetLanguage}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
              <div className="text-2xl font-bold">{job.results.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Accept</div>
              <div className="text-2xl font-bold text-green-600">{acceptCount}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Revise</div>
              <div className="text-2xl font-bold text-yellow-600">{reviseCount}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg Scores</div>
              <div className="text-sm font-medium">
                Fwd: {avgForwardScore.toFixed(1)} | Final: {avgFinalScore.toFixed(1)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="ACCEPT">Accept Only</SelectItem>
            <SelectItem value="REVISE">Revise Only</SelectItem>
          </SelectContent>
        </Select>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {paginatedResults.map(result => {
          const isExpanded = expandedRows.has(result.rowIndex);

          return (
            <Card key={result.rowIndex}>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Row #{result.rowIndex}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        result.recommendation === 'ACCEPT'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {result.recommendation}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(result.rowIndex)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Original</div>
                      <div className="text-sm">
                        {isExpanded ? result.originalText : truncateText(result.originalText)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Translated</div>
                      <div className="text-sm">
                        {isExpanded ? result.translatedText : truncateText(result.translatedText)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Forward Score:</span>{' '}
                      <span className="font-medium">{result.forwardQualityScore}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Final Score:</span>{' '}
                      <span className="font-medium">{result.finalQualityScore}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 pt-3 border-t">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Back Translation
                        </div>
                        <div className="text-sm">{result.backTranslation}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Evaluator Feedback
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{result.evaluatorFeedback}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Comparator Feedback
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{result.comparatorFeedback}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
