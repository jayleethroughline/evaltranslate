# Implementation Roadmap: Clinical Translation with Self-Learning

## Phase 1: Enhanced Data Models (Week 1)

### 1.1 Extended Type Definitions

```typescript
// Add to src/types/index.ts

export interface ClinicalContext {
  specialty: 'depression' | 'anxiety' | 'trauma' | 'eating_disorders' | 'substance_abuse' | 'general';
  therapeuticApproach?: 'cbt' | 'psychodynamic' | 'person_centered' | 'dbt' | 'act';
  ageGroup?: 'child' | 'adolescent' | 'adult' | 'geriatric';
  culturalBackground?: string;
  formalityLevel?: 'formal' | 'warm' | 'casual';
}

export interface AgentActivity {
  agentName: 'forward' | 'evaluator' | 'backward' | 'comparator' | 'reflector';
  status: 'idle' | 'thinking' | 'complete' | 'error';
  startTime?: string;
  endTime?: string;
  input?: string;
  output?: string;
  reasoning?: string[];
  confidence?: number;
  flags?: AgentFlag[];
}

export interface AgentFlag {
  type: 'clinical_term' | 'cultural_adaptation' | 'warning' | 'concern' | 'success';
  text: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface EnhancedTranslationResult extends TranslationResult {
  agentActivities: AgentActivity[];
  clinicalTerms: ClinicalTerm[];
  culturalAdaptations: CulturalAdaptation[];
  detailedScores: {
    clinicalAccuracy: number;
    culturalAppropriateness: number;
    therapeuticEffectiveness: number;
    linguisticQuality: number;
  };
}

export interface ClinicalTerm {
  original: string;
  translated: string;
  context: string;
  confidence: number;
  alternatives?: string[];
}

export interface CulturalAdaptation {
  type: 'idiom' | 'metaphor' | 'formality' | 'directness' | 'stigma_reduction';
  original: string;
  adapted: string;
  reasoning: string;
}

export interface UserFeedback {
  translationId: string;
  rowIndex: number;
  rating: 1 | 2 | 3 | 4 | 5;
  clinicalAccuracy?: 1 | 2 | 3 | 4 | 5;
  culturalFit?: 1 | 2 | 3 | 4 | 5;
  emotionalTone?: 1 | 2 | 3 | 4 | 5;
  comments?: string;
  suggestedImprovement?: string;
  saveAsExample: boolean;
  timestamp: string;
}

export interface LearningData {
  clinicalTermGlossary: Record<string, ClinicalTermEntry>;
  culturalPatterns: CulturalPattern[];
  successfulTranslations: ExampleTranslation[];
  userFeedbackHistory: UserFeedback[];
  qualityTrends: QualityMetric[];
}

export interface ClinicalTermEntry {
  term: string;
  translations: Record<string, {
    text: string;
    context: string;
    confidence: number;
    usageCount: number;
    userRatings: number[];
    lastUsed: string;
  }>;
}

export interface CulturalPattern {
  language: string;
  pattern: string;
  description: string;
  examples: string[];
  successRate: number;
}

export interface ExampleTranslation {
  id: string;
  original: string;
  translated: string;
  language: string;
  clinicalContext: ClinicalContext;
  qualityScore: number;
  userRating: number;
  savedAt: string;
}
```

### 1.2 Update Constants with Clinical Prompts

Replace `src/lib/constants.ts` prompts with clinical versions from CLINICAL_PROMPTS.md

---

## Phase 2: Real-Time Agent Tracking (Week 2)

### 2.1 Enhanced Translation Engine

```typescript
// Update src/lib/services/TranslationEngine.ts

export class TranslationEngine {
  private apiKey: string;
  private onAgentUpdate?: (activity: AgentActivity) => void;
  private learningData?: LearningData;

  constructor(
    apiKey: string,
    onAgentUpdate?: (activity: AgentActivity) => void,
    learningData?: LearningData
  ) {
    this.apiKey = apiKey;
    this.onAgentUpdate = onAgentUpdate;
    this.learningData = learningData;
  }

  async translateRow(
    originalText: string,
    config: TranslationConfig,
    clinicalContext?: ClinicalContext
  ): Promise<EnhancedTranslationResult> {
    const agentActivities: AgentActivity[] = [];

    // Step 1: Forward Translation
    const forwardActivity = await this.runAgent(
      'forward',
      this.buildForwardPrompt(originalText, config, clinicalContext),
      'Translating with clinical context...'
    );
    agentActivities.push(forwardActivity);

    const translatedText = this.extractTranslation(forwardActivity.output);
    const clinicalTerms = this.extractClinicalTerms(forwardActivity.output);
    const culturalAdaptations = this.extractCulturalAdaptations(forwardActivity.output);

    // Step 2: Clinical Evaluation
    const evalActivity = await this.runAgent(
      'evaluator',
      this.buildEvaluatorPrompt(originalText, translatedText, config, clinicalContext),
      'Evaluating clinical accuracy...'
    );
    agentActivities.push(evalActivity);

    const detailedScores = this.extractDetailedScores(evalActivity.output);

    // Step 3: Back Translation
    const backActivity = await this.runAgent(
      'backward',
      this.buildBackwardPrompt(translatedText, config),
      'Verifying semantic equivalence...'
    );
    agentActivities.push(backActivity);

    const backTranslation = this.extractTranslation(backActivity.output);

    // Step 4: Clinical Comparison
    const compareActivity = await this.runAgent(
      'comparator',
      this.buildComparatorPrompt(originalText, translatedText, backTranslation, config, evalActivity.output),
      'Final quality assessment...'
    );
    agentActivities.push(compareActivity);

    const recommendation = this.extractRecommendation(compareActivity.output);

    // Step 5: Self-Learning Reflection (async, non-blocking)
    this.runReflectionAsync(
      originalText, translatedText, agentActivities, detailedScores, recommendation
    );

    return {
      rowIndex: 0,
      originalText,
      translatedText,
      forwardQualityScore: detailedScores.clinicalAccuracy,
      evaluatorFeedback: evalActivity.output || '',
      backTranslation,
      finalQualityScore: (
        detailedScores.clinicalAccuracy +
        detailedScores.culturalAppropriateness +
        detailedScores.therapeuticEffectiveness +
        detailedScores.linguisticQuality
      ) / 4,
      comparatorFeedback: compareActivity.output || '',
      recommendation,
      agentActivities,
      clinicalTerms,
      culturalAdaptations,
      detailedScores
    };
  }

  private async runAgent(
    agentName: AgentActivity['agentName'],
    prompt: string,
    statusText: string
  ): Promise<AgentActivity> {
    const activity: AgentActivity = {
      agentName,
      status: 'thinking',
      startTime: new Date().toISOString(),
      input: prompt,
      reasoning: [statusText]
    };

    // Notify UI of activity start
    this.onAgentUpdate?.(activity);

    try {
      const output = await this.callGemini(prompt);

      activity.status = 'complete';
      activity.endTime = new Date().toISOString();
      activity.output = output;
      activity.confidence = this.extractConfidence(output);
      activity.flags = this.extractFlags(output);

      // Notify UI of completion
      this.onAgentUpdate?.(activity);

      return activity;
    } catch (error) {
      activity.status = 'error';
      activity.endTime = new Date().toISOString();
      activity.output = error instanceof Error ? error.message : 'Unknown error';

      this.onAgentUpdate?.(activity);

      throw error;
    }
  }

  private buildForwardPrompt(
    text: string,
    config: TranslationConfig,
    clinicalContext?: ClinicalContext
  ): string {
    // Use clinical prompts from constants
    // Inject learning data: glossary, patterns, examples
    // Include clinical context
    return this.fillPrompt(config.prompts.forwardTranslator, {
      targetLanguage: config.targetLanguage,
      text: text,
      customInstructions: config.customPrompt || '',
      clinicalSpecialty: clinicalContext?.specialty || 'general',
      therapeuticApproach: clinicalContext?.therapeuticApproach || 'person_centered',
      ageGroup: clinicalContext?.ageGroup || 'adult',
      culturalContext: clinicalContext?.culturalBackground || '',
      previousSuccessfulTranslations: this.getRelevantExamples(text),
      clinicalTermGlossary: this.getRelevantTerms(text),
      culturalAdaptationNotes: this.getRelevantPatterns(config.targetLanguage)
    });
  }

  private getRelevantExamples(text: string): string {
    // Find similar successful translations from learning data
    // Use semantic similarity or keyword matching
    if (!this.learningData?.successfulTranslations) return '';

    const relevant = this.learningData.successfulTranslations
      .filter(ex => this.calculateSimilarity(text, ex.original) > 0.7)
      .slice(0, 3)
      .map(ex => `Original: "${ex.original}"\nTranslation: "${ex.translated}"\nScore: ${ex.qualityScore}`)
      .join('\n\n');

    return relevant ? `PREVIOUS SUCCESSFUL EXAMPLES:\n${relevant}` : '';
  }

  private extractClinicalTerms(agentOutput: string): ClinicalTerm[] {
    // Parse "CLINICAL NOTES" section from agent output
    // Extract term mappings
    const terms: ClinicalTerm[] = [];
    const match = agentOutput.match(/Terms translated:(.*?)(?=\n\n|\n-|$)/s);
    if (match) {
      // Parse terms from output
      // Format: "depression" → "抑郁症" (confidence: 0.95)
    }
    return terms;
  }

  private extractDetailedScores(evaluatorOutput: string): EnhancedTranslationResult['detailedScores'] {
    // Parse SCORES section from evaluator output
    return {
      clinicalAccuracy: this.extractScore(evaluatorOutput, 'Clinical Accuracy'),
      culturalAppropriateness: this.extractScore(evaluatorOutput, 'Cultural Appropriateness'),
      therapeuticEffectiveness: this.extractScore(evaluatorOutput, 'Therapeutic Effectiveness'),
      linguisticQuality: this.extractScore(evaluatorOutput, 'Linguistic Quality')
    };
  }

  // ... rest of implementation
}
```

---

## Phase 3: UI Components (Week 3-4)

### 3.1 Agent Communication Timeline

```typescript
// Create src/components/translation/AgentTimeline.tsx

export function AgentTimeline({ activities }: { activities: AgentActivity[] }) {
  return (
    <div className="space-y-4 p-4">
      {activities.map((activity, idx) => (
        <AgentCard key={idx} activity={activity} />
      ))}
    </div>
  );
}

function AgentCard({ activity }: { activity: AgentActivity }) {
  const icon = getAgentIcon(activity.agentName);
  const color = getAgentColor(activity.agentName);

  return (
    <Card className={`border-l-4 border-${color}-500`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-semibold">{getAgentTitle(activity.agentName)}</h3>
            <StatusBadge status={activity.status} />
          </div>
          <span className="text-sm text-muted-foreground">
            {activity.endTime && calculateDuration(activity.startTime!, activity.endTime)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {activity.status === 'thinking' && (
          <div className="flex items-center gap-2">
            <LoadingSpinner />
            <span>{activity.reasoning?.[0] || 'Processing...'}</span>
          </div>
        )}

        {activity.status === 'complete' && (
          <div className="space-y-3">
            <Collapsible>
              <CollapsibleTrigger>
                <div className="flex items-center gap-2">
                  📝 View Output
                  {activity.confidence && (
                    <Badge>Confidence: {activity.confidence}%</Badge>
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-3 bg-muted rounded text-sm whitespace-pre-wrap">
                  {activity.output}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {activity.flags && activity.flags.length > 0 && (
              <div className="space-y-1">
                {activity.flags.map((flag, i) => (
                  <AgentFlag key={i} flag={flag} />
                ))}
              </div>
            )}
          </div>
        )}

        {activity.status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{activity.output}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
```

### 3.2 Clinical Context Panel

```typescript
// Create src/components/translation/ClinicalContextPanel.tsx

export function ClinicalContextPanel({
  context,
  onChange
}: {
  context: ClinicalContext;
  onChange: (context: ClinicalContext) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinical Context</CardTitle>
        <CardDescription>
          Provide context to improve translation quality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Clinical Specialty</Label>
          <Select
            value={context.specialty}
            onValueChange={(v) => onChange({ ...context, specialty: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="depression">Depression</SelectItem>
              <SelectItem value="anxiety">Anxiety Disorders</SelectItem>
              <SelectItem value="trauma">Trauma & PTSD</SelectItem>
              <SelectItem value="eating_disorders">Eating Disorders</SelectItem>
              <SelectItem value="substance_abuse">Substance Abuse</SelectItem>
              <SelectItem value="general">General Psychology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Therapeutic Approach</Label>
          <Select
            value={context.therapeuticApproach}
            onValueChange={(v) => onChange({ ...context, therapeuticApproach: v as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select approach..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cbt">Cognitive Behavioral Therapy (CBT)</SelectItem>
              <SelectItem value="psychodynamic">Psychodynamic</SelectItem>
              <SelectItem value="person_centered">Person-Centered</SelectItem>
              <SelectItem value="dbt">Dialectical Behavior Therapy (DBT)</SelectItem>
              <SelectItem value="act">Acceptance & Commitment Therapy (ACT)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Similar for age group, cultural background, formality */}
      </CardContent>
    </Card>
  );
}
```

### 3.3 Quality Feedback Widget

```typescript
// Create src/components/translation/QualityFeedback.tsx

export function QualityFeedback({
  result,
  onSubmit
}: {
  result: EnhancedTranslationResult;
  onSubmit: (feedback: UserFeedback) => void;
}) {
  const [feedback, setFeedback] = useState<Partial<UserFeedback>>({
    rating: 5,
    saveAsExample: false
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Star className="w-4 h-4 mr-2" />
          Provide Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quality Feedback</DialogTitle>
          <DialogDescription>
            Help improve future translations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Overall Quality</Label>
            <StarRating
              value={feedback.rating}
              onChange={(v) => setFeedback({ ...feedback, rating: v })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Clinical Accuracy</Label>
              <StarRating
                value={feedback.clinicalAccuracy}
                onChange={(v) => setFeedback({ ...feedback, clinicalAccuracy: v })}
              />
            </div>
            <div>
              <Label>Cultural Fit</Label>
              <StarRating
                value={feedback.culturalFit}
                onChange={(v) => setFeedback({ ...feedback, culturalFit: v })}
              />
            </div>
            <div>
              <Label>Emotional Tone</Label>
              <StarRating
                value={feedback.emotionalTone}
                onChange={(v) => setFeedback({ ...feedback, emotionalTone: v })}
              />
            </div>
          </div>

          <div>
            <Label>Comments (Optional)</Label>
            <Textarea
              placeholder="What worked well? What could be improved?"
              value={feedback.comments}
              onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
            />
          </div>

          <div>
            <Label>Suggested Improvement (Optional)</Label>
            <Textarea
              placeholder="Provide a better translation if you have one..."
              value={feedback.suggestedImprovement}
              onChange={(e) => setFeedback({ ...feedback, suggestedImprovement: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="save-example"
              checked={feedback.saveAsExample}
              onCheckedChange={(checked) =>
                setFeedback({ ...feedback, saveAsExample: checked as boolean })
              }
            />
            <Label htmlFor="save-example">
              Save as training example for future translations
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onSubmit(feedback as UserFeedback)}>
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Phase 4: Self-Learning System (Week 5)

### 4.1 Learning Data Manager

```typescript
// Create src/lib/services/LearningDataManager.ts

export class LearningDataManager {
  private storage: LocalStorageManager;

  saveFeedback(feedback: UserFeedback): void {
    const learningData = this.getLearningData();
    learningData.userFeedbackHistory.push(feedback);

    // Update clinical term glossary if rating is high
    if (feedback.rating >= 4 && feedback.clinicalAccuracy >= 4) {
      this.updateClinicalTerms(feedback);
    }

    // Save as example if requested
    if (feedback.saveAsExample) {
      this.saveAsExample(feedback);
    }

    this.saveLearningData(learningData);
  }

  async analyzeAndLearn(): Promise<void> {
    const learningData = this.getLearningData();
    const recentFeedback = learningData.userFeedbackHistory.slice(-100);

    // Identify patterns in successful translations
    const successPatterns = this.identifySuccessPatterns(recentFeedback);

    // Update cultural patterns based on user feedback
    const culturalUpdates = this.analyzeCulturalFeedback(recentFeedback);

    // Build/update term glossary
    const termUpdates = this.buildTermGlossary(recentFeedback);

    // Calculate quality trends
    const trends = this.calculateQualityTrends(recentFeedback);

    // Save all learnings
    this.applyLearnings({
      successPatterns,
      culturalUpdates,
      termUpdates,
      trends
    });
  }

  getLearningContext(): string {
    // Return formatted string of learnings to inject into prompts
    const learningData = this.getLearningData();

    return `
CLINICAL TERM GLOSSARY:
${this.formatTermGlossary(learningData.clinicalTermGlossary)}

CULTURAL PATTERNS:
${this.formatCulturalPatterns(learningData.culturalPatterns)}

TOP SUCCESSFUL EXAMPLES:
${this.formatExamples(learningData.successfulTranslations.slice(0, 5))}
    `.trim();
  }
}
```

### 4.2 Integration with Translation Flow

```typescript
// Update useTranslation hook

export function useTranslation() {
  const learningManager = new LearningDataManager();

  const startJob = useCallback(async (jobId: string) => {
    // Get learning context
    const learningContext = learningManager.getLearningContext();

    // Pass to translation service
    await translationService.startJob(jobId, learningContext);
  }, []);

  const submitFeedback = useCallback(async (
    jobId: string,
    rowIndex: number,
    feedback: UserFeedback
  ) => {
    // Save feedback
    learningManager.saveFeedback(feedback);

    // Trigger async learning analysis
    learningManager.analyzeAndLearn().catch(console.error);

    // Show success toast
    toast({
      title: 'Feedback Saved',
      description: 'Thank you! This helps improve future translations.'
    });
  }, []);

  return { startJob, submitFeedback, ... };
}
```

---

## Phase 5: Analytics Dashboard (Week 6)

### 5.1 Clinical Dashboard Component

```typescript
// Create src/components/translation/ClinicalDashboard.tsx

export function ClinicalDashboard() {
  const learningData = useLearningData();
  const stats = useAggregateStats();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          title="Total Translations"
          value={stats.totalTranslations}
          icon={<FileText />}
        />
        <StatsCard
          title="Average Quality"
          value={`${stats.avgQuality}/100`}
          icon={<TrendingUp />}
          trend={stats.qualityTrend}
        />
        <StatsCard
          title="Acceptance Rate"
          value={`${stats.acceptanceRate}%`}
          icon={<CheckCircle />}
        />
        <StatsCard
          title="Clinical Terms"
          value={stats.clinicalTermsCount}
          icon={<Book />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quality Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <QualityTrendChart data={learningData.qualityTrends} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clinical Term Glossary</CardTitle>
          <CardDescription>
            {Object.keys(learningData.clinicalTermGlossary).length} terms learned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClinicalGlossaryTable glossary={learningData.clinicalTermGlossary} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cultural Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <CulturalPatternsDisplay patterns={learningData.culturalPatterns} />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Timeline Summary

- **Week 1**: Data models & clinical prompts
- **Week 2**: Real-time agent tracking
- **Week 3-4**: UI components (timeline, feedback, context)
- **Week 5**: Self-learning system
- **Week 6**: Analytics dashboard

## Success Metrics

- Quality scores trend upward over time
- User feedback ratings improve
- Clinical term glossary grows
- Acceptance rate increases
- Translation speed improves (learning from patterns)
- Cultural appropriateness scores improve

## Future Enhancements

- Multi-turn agent conversations (agents can ask questions)
- Active learning (system requests feedback on uncertain cases)
- Export/import glossaries between installations
- Collaborative glossary building (shared across users)
- A/B testing of prompt variations
- Integration with terminology databases (DSM-5, ICD-11)
