export interface Dataset {
  id: string;
  name: string;
  description?: string;
  columns: Array<{
    name: string;
    type: 'prompt' | 'context' | 'completion' | 'text';
  }>;
  data: Array<Record<string, any>>;
  metadata: {
    rowCount: number;
    createdAt: string;
    updatedAt: string;
    sourceType?: 'upload' | 'translation';
    sourceJobId?: string;
  };
}

export interface TranslationJob {
  id: string;
  sourceDatasetId: string;
  sourceDatasetName: string;
  outputDatasetId?: string;
  targetLanguage: string;
  customPrompt?: string;
  agentPrompts: {
    forwardTranslator: string;
    evaluator: string;
    backwardTranslator: string;
    comparator: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress: {
    current: number;
    total: number;
    startTime?: string;
    endTime?: string;
  };
  error?: string;
  results: TranslationResult[];
  createdAt: string;
  updatedAt: string;
}

export interface TranslationResult {
  rowIndex: number;
  originalText: string;
  translatedText: string;
  forwardQualityScore: number;
  evaluatorFeedback: string;
  backTranslation: string;
  finalQualityScore: number;
  comparatorFeedback: string;
  recommendation: 'ACCEPT' | 'REVISE';
}

export interface TranslationConfig {
  targetLanguage: string;
  customPrompt?: string;
  prompts: {
    forwardTranslator: string;
    evaluator: string;
    backwardTranslator: string;
    comparator: string;
  };
}

export interface Language {
  code: string;
  name: string;
}
