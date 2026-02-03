import { LearningData, UserFeedback, RiskSignal } from '@/types';

const LEARNING_DATA_KEY = 'translation_app_learning_data';

export class LearningDataManager {
  private getLearningData(): LearningData {
    try {
      const data = localStorage.getItem(LEARNING_DATA_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
    }

    // Return default structure
    return {
      riskTermGlossary: {},
      successfulExamples: [],
      severityPatterns: [],
      userFeedbackHistory: [],
      qualityMetrics: {
        totalTranslations: 0,
        avgRiskPreservation: 0,
        avgSeverityAccuracy: 0,
        acceptanceRate: 0,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  private saveLearningData(data: LearningData): void {
    try {
      localStorage.setItem(LEARNING_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving learning data:', error);
    }
  }

  saveFeedback(feedback: UserFeedback): void {
    console.log('[LearningDataManager] Saving feedback:', feedback);
    const learningData = this.getLearningData();

    learningData.userFeedbackHistory.push(feedback);

    // Update quality metrics
    this.updateQualityMetrics(learningData);

    this.saveLearningData(learningData);
    console.log('[LearningDataManager] Feedback saved successfully');
  }

  saveRiskTerm(
    english: string,
    translated: string,
    language: string,
    context: string,
    riskCategory: string,
    severityLevel: number,
    confidence: number
  ): void {
    console.log('[LearningDataManager] Saving risk term:', english, '→', translated);
    const learningData = this.getLearningData();

    if (!learningData.riskTermGlossary[english]) {
      learningData.riskTermGlossary[english] = {
        english,
        translations: {}
      };
    }

    if (!learningData.riskTermGlossary[english].translations[language]) {
      learningData.riskTermGlossary[english].translations[language] = {
        text: translated,
        context,
        riskCategory,
        severityLevel,
        confidence,
        usageCount: 1,
        userRatings: [],
        lastUsed: new Date().toISOString()
      };
    } else {
      const existing = learningData.riskTermGlossary[english].translations[language];
      existing.usageCount++;
      existing.lastUsed = new Date().toISOString();
      // Update confidence if higher
      if (confidence > existing.confidence) {
        existing.confidence = confidence;
      }
    }

    this.saveLearningData(learningData);
  }

  saveSuccessfulExample(
    original: string,
    translated: string,
    language: string,
    riskCategory: string,
    severityLevel: number,
    qualityScore: number,
    userRating: number,
    riskSignals: RiskSignal[]
  ): void {
    console.log('[LearningDataManager] Saving successful example');
    const learningData = this.getLearningData();

    learningData.successfulExamples.push({
      id: `example-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      original,
      translated,
      language,
      riskCategory,
      severityLevel,
      qualityScore,
      userRating,
      riskSignals,
      savedAt: new Date().toISOString()
    });

    // Keep only the best 100 examples
    if (learningData.successfulExamples.length > 100) {
      learningData.successfulExamples.sort((a, b) => b.qualityScore - a.qualityScore);
      learningData.successfulExamples = learningData.successfulExamples.slice(0, 100);
    }

    this.saveLearningData(learningData);
  }

  getLearningContext(language: string): string {
    const learningData = this.getLearningData();

    // Format risk term glossary
    const glossaryText = this.formatRiskGlossary(learningData, language);

    // Format successful examples
    const examplesText = this.formatSuccessfulExamples(learningData, language);

    // Format severity patterns
    const patternsText = this.formatSeverityPatterns(learningData, language);

    return `
PREVIOUS LEARNINGS:

${glossaryText}

${examplesText}

${patternsText}
    `.trim();
  }

  private formatRiskGlossary(learningData: LearningData, language: string): string {
    const terms = Object.values(learningData.riskTermGlossary)
      .filter(term => term.translations[language])
      .slice(0, 20) // Top 20 most relevant
      .map(term => {
        const translation = term.translations[language];
        return `- "${term.english}" → "${translation.text}" (${translation.riskCategory}, severity: ${translation.severityLevel}, used: ${translation.usageCount}x, confidence: ${Math.round(translation.confidence * 100)}%)`;
      });

    if (terms.length === 0) {
      return 'RISK TERM GLOSSARY: (Building...)';
    }

    return `RISK TERM GLOSSARY (${language}):
${terms.join('\n')}`;
  }

  private formatSuccessfulExamples(learningData: LearningData, language: string): string {
    const examples = learningData.successfulExamples
      .filter(ex => ex.language === language && ex.userRating >= 4)
      .slice(0, 5) // Top 5 examples
      .map((ex, idx) => {
        return `${idx + 1}. Original: "${ex.original}"
   Translation: "${ex.translated}"
   Risk: ${ex.riskCategory} (severity: ${ex.severityLevel})
   Quality: ${ex.qualityScore}/100, User rating: ${ex.userRating}/5`;
      });

    if (examples.length === 0) {
      return 'SUCCESSFUL EXAMPLES: (Building...)';
    }

    return `SUCCESSFUL EXAMPLES:
${examples.join('\n\n')}`;
  }

  private formatSeverityPatterns(learningData: LearningData, language: string): string {
    const patterns = learningData.severityPatterns
      .filter(p => p.language === language)
      .slice(0, 5)
      .map(p => {
        return `- Severity ${p.severityLevel}: ${p.successfulApproach} (success rate: ${Math.round(p.successRate * 100)}%)
  Example: "${p.example}"`;
      });

    if (patterns.length === 0) {
      return 'SEVERITY PATTERNS: (Building...)';
    }

    return `SEVERITY PRESERVATION PATTERNS:
${patterns.join('\n')}`;
  }

  private updateQualityMetrics(learningData: LearningData): void {
    const recentFeedback = learningData.userFeedbackHistory.slice(-100);

    if (recentFeedback.length === 0) return;

    const totalRatings = recentFeedback.length;
    const sumRiskPreservation = recentFeedback
      .filter(f => f.riskPreservation)
      .reduce((sum, f) => sum + (f.riskPreservation || 0), 0);
    const sumSeverityAccuracy = recentFeedback
      .filter(f => f.severityAccuracy)
      .reduce((sum, f) => sum + (f.severityAccuracy || 0), 0);
    const acceptCount = recentFeedback.filter(f => f.overallRating >= 4).length;

    learningData.qualityMetrics = {
      totalTranslations: learningData.qualityMetrics.totalTranslations + 1,
      avgRiskPreservation: sumRiskPreservation / totalRatings,
      avgSeverityAccuracy: sumSeverityAccuracy / totalRatings,
      acceptanceRate: acceptCount / totalRatings,
      lastUpdated: new Date().toISOString()
    };
  }

  extractRiskSignalsFromOutput(agentOutput: string): RiskSignal[] {
    const signals: RiskSignal[] = [];

    // Parse "RISK SIGNALS PRESERVED:" section
    const signalsMatch = agentOutput.match(/RISK SIGNALS PRESERVED:(.*?)(?=\n\n|\nCONFIDENCE:|$)/s);

    if (signalsMatch) {
      const signalsText = signalsMatch[1];
      const lines = signalsText.split('\n').filter(l => l.trim().startsWith('-'));

      for (const line of lines) {
        // Parse format: "- [original] → [translated] (type: [signal_type])"
        const match = line.match(/["'](.+?)["']\s*→\s*["'](.+?)["']/);
        if (match) {
          signals.push({
            type: 'method', // Can be refined with more parsing
            original: match[1],
            translated: match[2],
            preserved: true,
            confidence: 0.9
          });
        }
      }
    }

    return signals;
  }

  analyzeAndLearn(): void {
    console.log('[LearningDataManager] Running analysis and learning...');
    const learningData = this.getLearningData();
    const recentFeedback = learningData.userFeedbackHistory.slice(-50);

    // Identify high-quality translations to save as examples
    const highQuality = recentFeedback.filter(f =>
      f.overallRating >= 4 &&
      f.riskPreservation && f.riskPreservation >= 4 &&
      f.saveAsExample
    );

    console.log(`[LearningDataManager] Found ${highQuality.length} high-quality examples to learn from`);

    // TODO: More sophisticated pattern analysis
    // - Identify common successful translation patterns
    // - Detect risk signal preservation strategies
    // - Build severity mapping patterns

    this.saveLearningData(learningData);
    console.log('[LearningDataManager] Learning analysis complete');
  }

  getQualityMetrics() {
    return this.getLearningData().qualityMetrics;
  }

  getGlossarySize(): number {
    return Object.keys(this.getLearningData().riskTermGlossary).length;
  }

  getExamplesCount(): number {
    return this.getLearningData().successfulExamples.length;
  }
}

export const learningDataManager = new LearningDataManager();
