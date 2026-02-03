import { useState } from 'react';
import { ArrowLeft, Download, Edit } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { datasetService } from '@/lib/services/DatasetService';

interface TranslationResultsViewerProps {
  job: TranslationJob;
  onBack: () => void;
}

export function TranslationResultsViewer({ job, onBack }: TranslationResultsViewerProps) {
  // State management for table view and editing
  const [filter, setFilter] = useState<'all' | 'ACCEPT' | 'REVISE'>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedTranslations, setEditedTranslations] = useState<Record<number, string>>({});
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [revisionData, setRevisionData] = useState<{
    rowIndex: number;
    original: string;
    revised: string;
    recommendation: string;
  } | null>(null);

  const itemsPerPage = 50;

  // Load source dataset to get category and risk_level
  const sourceDataset = datasetService.getDataset(job.sourceDatasetId);

  const handleApplyRevision = (rowIndex: number, currentTranslation: string, recommendation: string) => {
    const revisedTranslation = extractRevisedTranslation(recommendation);
    if (revisedTranslation) {
      setRevisionData({
        rowIndex,
        original: currentTranslation,
        revised: revisedTranslation,
        recommendation
      });
      setShowRevisionDialog(true);
    } else {
      // If can't extract, allow manual editing
      setEditingRow(rowIndex);
      setEditedTranslations(prev => ({ ...prev, [rowIndex]: currentTranslation }));
    }
  };

  const confirmRevision = () => {
    if (revisionData) {
      setEditedTranslations(prev => ({
        ...prev,
        [revisionData.rowIndex]: revisionData.revised
      }));
    }
    setShowRevisionDialog(false);
    setRevisionData(null);
  };

  const handleSaveEdit = () => {
    // Save the edited translation (in a real app, you'd update the job in storage)
    setEditingRow(null);
    // You could also call a service method here to persist the change
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
  };

  const filteredResults = filter === 'all'
    ? job.results
    : job.results.filter(r => r.recommendation === filter);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const extractCleanTranslation = (translatedText: string): string => {
    // Remove various TRANSLATION prefixes: **TRANSLATION:**, ***TRANSLATION**, etc.
    let cleaned = translatedText
      .replace(/^\*+\s*TRANSLATION(\s*\([^)]+\))?\s*\*+:?\s*/gi, '')
      .replace(/^\*+Translation(\s*\([^)]+\))?\*+:?\s*/gi, '')
      .replace(/^\*+\s*/g, '')  // Remove leading asterisks
      .replace(/\s*\*+\s*---\s*\*?.*/g, '')  // Remove trailing *** --- *...
      .replace(/\s*---\s*.*/g, '')  // Remove trailing --- ...
      .replace(/^["']|["']$/g, '')
      .trim();

    // Get text before analysis sections
    const beforeAnalysis = cleaned.split(/\*\*(?:RISK ANALYSIS|TRANSLATION DECISIONS|CULTURAL ADAPTATION|CONFIDENCE):\*\*/i)[0];

    return beforeAnalysis.replace(/\s*\*+\s*$/g, '').trim();  // Remove trailing asterisks
  };

  const extractTranslationRationale = (translatedText: string): string => {
    // Extract everything after the translation for hover tooltip
    const parts = translatedText.split(/\*\*(?:RISK ANALYSIS|TRANSLATION DECISIONS|CULTURAL ADAPTATION):\*\*/i);
    if (parts.length > 1) {
      return translatedText.substring(parts[0].length).trim();
    }
    return '';
  };

  const extractCleanBackTranslation = (backTranslation: string): string => {
    // Remove various preambles
    let cleaned = backTranslation
      // Remove "Here is the translation..."
      .replace(/^(?:Here is |Here's |This is )?(?:the |a )?(?:literal |direct )?(?:translation|back-?translation|English translation) of (?:the )?(?:Korean|translated) (?:text|sentence|version)(?:\s+back)?\s+(?:into English|to English)?[,:.\s]*/i, '')
      // Remove "To verify the preservation..." or "To expose any shifts..."
      .replace(/^To (?:verify|expose|facilitate)[^.]*\.\s*/i, '')
      // Remove "provided, translated as literally as possible..."
      .replace(/^provided,?\s+(?:translated as literally as possible|intended to expose|aimed at exposing)[^.]*\.\s*/i, '')
      // Remove "rendered as literally as possible..."
      .replace(/^rendered as literally as possible[^.]*\.\s*/i, '')
      // Remove "and the accompanying reasoning..."
      .replace(/^and the accompanying reasoning[^.]*\.\s*/i, '')
      // Remove **Literal Translation:** or similar
      .replace(/^\*+\s*(?:Literal Translation|Literal Breakdown|###)\s*\*+:?\s*/gi, '')
      // Remove leading asterisks and ###
      .replace(/^\*+\s*###\s*/g, '')
      // Remove ***TRANSLATION** prefix
      .replace(/^\*+\s*TRANSLATION\s*\*+:?\s*/gi, '')
      // Remove "The text says" or "It says"
      .replace(/^(?:The text says|It says|Translation):\s*/i, '')
      .trim();

    // If we removed everything, return original
    return cleaned || backTranslation.trim();
  };

  const extractRevisionRecommendation = (feedback: string): string => {
    // Extract the "IF REVISE" or "Required Changes" section
    const reviseMatch = feedback.match(/(?:IF REVISE|Required Changes):\s*\n?(.*?)(?:\n\n|$)/s);
    if (reviseMatch) {
      return reviseMatch[1].trim();
    }
    return '';
  };

  const extractRevisedTranslation = (recommendation: string): string => {
    // Try to extract quoted Korean text from the recommendation
    // Patterns: "Change 'X' to 'Y'" or "Use 'Y' instead"
    const changeMatch = recommendation.match(/(?:to|Use)\s+['"']([^'"']+)['"']/);
    if (changeMatch) {
      return extractCleanTranslation(changeMatch[1]);
    }
    return '';
  };

  const getCategoryAndRiskLevel = (rowIndex: number) => {
    if (!sourceDataset) return { category: '-', riskLevel: '-' };

    const sourceRow = sourceDataset.data[rowIndex];
    if (!sourceRow) return { category: '-', riskLevel: '-' };

    // Try different possible column names (case-insensitive)
    const getCaseInsensitiveValue = (row: any, possibleNames: string[]) => {
      for (const name of possibleNames) {
        // Try exact match first
        if (row[name]) return row[name];
        // Try case-insensitive match
        const foundKey = Object.keys(row).find(k => k.toLowerCase() === name.toLowerCase());
        if (foundKey && row[foundKey]) return row[foundKey];
      }
      return '-';
    };

    const category = getCaseInsensitiveValue(sourceRow, ['Category', 'category', 'risk_category']);
    const riskLevel = getCaseInsensitiveValue(sourceRow, ['Risk Level', 'risk_level', 'severity_level', 'severity']);

    return { category, riskLevel };
  };

  const handleExport = () => {
    // Load source dataset to get category and risk_level
    const sourceDataset = datasetService.getDataset(job.sourceDatasetId);

    if (!sourceDataset) {
      console.error('Source dataset not found');
      return;
    }

    // Create 3-column export: translated_prompt (clean), category, risk_level
    const data = job.results.map(result => {
      const { category, riskLevel } = getCategoryAndRiskLevel(result.rowIndex);
      const cleanTranslation = extractCleanTranslation(result.translatedText);
      // Use edited translation if available
      const finalTranslation = editedTranslations[result.rowIndex] || cleanTranslation;

      return {
        prompt: finalTranslation,
        category: category,
        risk_level: riskLevel
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

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Category</th>
              <th className="px-3 py-2 text-left font-medium">Risk Level</th>
              <th className="px-3 py-2 text-left font-medium">Original</th>
              <th className="px-3 py-2 text-left font-medium">Translated</th>
              <th className="px-3 py-2 text-left font-medium">Back Translated</th>
              <th className="px-3 py-2 text-center font-medium">Fwd Score</th>
              <th className="px-3 py-2 text-center font-medium">Final Score</th>
              <th className="px-3 py-2 text-center font-medium">Decision</th>
              <th className="px-3 py-2 text-left font-medium">Revision Needed</th>
            </tr>
          </thead>
          <tbody>
            {paginatedResults.map(result => {
              const { category, riskLevel } = getCategoryAndRiskLevel(result.rowIndex);
              const cleanTranslation = extractCleanTranslation(result.translatedText);
              const translationRationale = extractTranslationRationale(result.translatedText);
              const cleanBackTranslation = extractCleanBackTranslation(result.backTranslation);
              const revisionRec = extractRevisionRecommendation(result.comparatorFeedback);

              return (
                <tr key={result.rowIndex} className="border-t hover:bg-muted/50">
                  <td className="px-3 py-2">{category}</td>
                  <td className="px-3 py-2">{riskLevel}</td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="truncate" title={result.originalText}>
                      {truncateText(result.originalText, 80)}
                    </div>
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    {editingRow === result.rowIndex ? (
                      <div className="flex gap-2">
                        <textarea
                          className="w-full p-2 border rounded text-sm"
                          rows={3}
                          value={editedTranslations[result.rowIndex] || cleanTranslation}
                          onChange={(e) => setEditedTranslations(prev => ({ ...prev, [result.rowIndex]: e.target.value }))}
                        />
                        <div className="flex flex-col gap-1">
                          <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="truncate cursor-help" title={translationRationale || cleanTranslation}>
                        {truncateText(editedTranslations[result.rowIndex] || cleanTranslation, 80)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="truncate" title={cleanBackTranslation}>
                      {truncateText(cleanBackTranslation, 80)}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center font-medium">
                    {result.forwardQualityScore}
                  </td>
                  <td className="px-3 py-2 text-center font-medium">
                    {result.finalQualityScore}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      result.recommendation === 'ACCEPT'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.recommendation}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {revisionRec ? (
                      <Button
                        variant="outline"
                        size="sm"
                        title={revisionRec}
                        className="text-xs"
                        onClick={() => handleApplyRevision(result.rowIndex, cleanTranslation, revisionRec)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

      {/* Revision Confirmation Dialog */}
      <AlertDialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Revision</AlertDialogTitle>
            <AlertDialogDescription>
              Review the suggested changes before applying them to the translation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {revisionData && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Original Translation:</h4>
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                  {revisionData.original}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Revised Translation:</h4>
                <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                  {revisionData.revised}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Recommendation:</h4>
                <div className="p-3 bg-muted rounded text-xs text-muted-foreground">
                  {revisionData.recommendation}
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevision}>
              Apply Revision
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
