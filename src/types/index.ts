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
  agentActivities?: AgentActivity[];
  riskSignals?: RiskSignal[];
  detailedScores?: {
    riskPreservation: number;
    classifierAccuracy: number;
    specificityPreserved: number;
    urgencyMaintained: number;
  };
}

export interface AgentActivity {
  agentName: 'forward' | 'evaluator' | 'backward' | 'comparator';
  status: 'idle' | 'thinking' | 'complete' | 'error';
  startTime?: string;
  endTime?: string;
  input?: string;
  output?: string;
  confidence?: number;
  duration?: number;
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

// Risk Detection & Self-Learning Types
export interface RiskContext {
  category?: 'suicidal' | 'self_harm' | 'harm_to_others' | 'abuse' | 'crisis' | 'low_risk';
  severityLevel?: number; // 0-10
  urgency?: 'immediate' | 'within_hours' | 'within_days' | 'chronic' | 'none';
}

export interface RiskSignal {
  type: 'suicidal' | 'self_harm' | 'harm_to_others' | 'abuse' | 'crisis' | 'method' | 'plan' | 'urgency' | 'intensity';
  original: string;
  translated: string;
  preserved: boolean;
  confidence: number;
}

export interface UserFeedback {
  translationResultId: string;
  jobId: string;
  rowIndex: number;
  overallRating: 1 | 2 | 3 | 4 | 5;
  riskPreservation?: 1 | 2 | 3 | 4 | 5;
  severityAccuracy?: 1 | 2 | 3 | 4 | 5;
  comments?: string;
  suggestedTranslation?: string;
  saveAsExample: boolean;
  timestamp: string;
}

export interface RiskTermEntry {
  english: string;
  translations: Record<string, {
    text: string;
    context: string;
    riskCategory: string;
    severityLevel: number;
    confidence: number;
    usageCount: number;
    userRatings: number[];
    lastUsed: string;
  }>;
}

export interface LearningData {
  riskTermGlossary: Record<string, RiskTermEntry>;
  successfulExamples: Array<{
    id: string;
    original: string;
    translated: string;
    language: string;
    riskCategory: string;
    severityLevel: number;
    qualityScore: number;
    userRating: number;
    riskSignals: RiskSignal[];
    savedAt: string;
  }>;
  severityPatterns: Array<{
    severityLevel: number;
    language: string;
    successfulApproach: string;
    example: string;
    successRate: number;
  }>;
  userFeedbackHistory: UserFeedback[];
  qualityMetrics: {
    totalTranslations: number;
    avgRiskPreservation: number;
    avgSeverityAccuracy: number;
    acceptanceRate: number;
    lastUpdated: string;
  };
}
