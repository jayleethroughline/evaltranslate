import { TranslationConfig, TranslationResult, AgentActivity, RiskSignal } from '@/types';
import { GEMINI_API_URL, API_CONFIG } from '@/lib/constants';
import { learningDataManager } from '@/lib/services/LearningDataManager';

export class TranslationEngine {
  private apiKey: string;
  private onAgentUpdate?: (activity: AgentActivity) => void;

  constructor(apiKey: string, onAgentUpdate?: (activity: AgentActivity) => void) {
    this.apiKey = apiKey;
    this.onAgentUpdate = onAgentUpdate;
  }

  async callGemini(prompt: string, retries = 0): Promise<string> {
    console.log('[TranslationEngine] Calling Gemini API...');
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      console.log('[TranslationEngine] Response status:', response.status);

      if (!response.ok) {
        if (response.status === 429 && retries < API_CONFIG.MAX_RETRIES) {
          // Rate limit - exponential backoff
          const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, retries);
          await this.delay(delay);
          return this.callGemini(prompt, retries + 1);
        }

        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      if (retries < API_CONFIG.MAX_RETRIES && error instanceof Error && error.message.includes('fetch')) {
        // Network error - retry
        const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, retries);
        await this.delay(delay);
        return this.callGemini(prompt, retries + 1);
      }
      throw error;
    }
  }

  async translateRow(
    originalText: string,
    config: TranslationConfig
  ): Promise<TranslationResult> {
    console.log('[TranslationEngine] Starting translation for:', originalText.substring(0, 50) + '...');

    // Step 1: Forward translation
    console.log('[TranslationEngine] Step 1: Forward translation');
    const forwardPrompt = this.fillPrompt(config.prompts.forwardTranslator, {
      targetLanguage: config.targetLanguage,
      text: originalText,
      customInstructions: config.customPrompt || ''
    });

    const translatedText = await this.callGemini(forwardPrompt);
    console.log('[TranslationEngine] Forward translation result:', translatedText.substring(0, 50) + '...');

    // Step 2: Evaluate forward translation
    console.log('[TranslationEngine] Step 2: Evaluating translation');
    const evaluatorPrompt = this.fillPrompt(config.prompts.evaluator, {
      targetLanguage: config.targetLanguage,
      originalText: originalText,
      translatedText: translatedText,
      customInstructions: config.customPrompt || ''
    });

    const evaluatorResponse = await this.callGemini(evaluatorPrompt);
    console.log('[TranslationEngine] Evaluator response:', evaluatorResponse);
    const forwardQualityScore = this.extractScore(evaluatorResponse);
    console.log('[TranslationEngine] Extracted forward quality score:', forwardQualityScore);
    const evaluatorFeedback = evaluatorResponse;

    // Step 3: Back translation
    const backwardPrompt = this.fillPrompt(config.prompts.backwardTranslator, {
      targetLanguage: config.targetLanguage,
      translatedText: translatedText
    });

    const backTranslation = await this.callGemini(backwardPrompt);

    // Step 4: Compare and decide
    const comparatorPrompt = this.fillPrompt(config.prompts.comparator, {
      targetLanguage: config.targetLanguage,
      originalText: originalText,
      backTranslation: backTranslation,
      forwardScore: forwardQualityScore.toString(),
      evaluatorFeedback: evaluatorFeedback,
      customInstructions: config.customPrompt || ''
    });

    const comparatorResponse = await this.callGemini(comparatorPrompt);
    console.log('[TranslationEngine] Comparator response:', comparatorResponse);
    const finalQualityScore = this.extractScore(comparatorResponse);
    console.log('[TranslationEngine] Extracted final quality score:', finalQualityScore);
    const recommendation = this.extractRecommendation(comparatorResponse);
    console.log('[TranslationEngine] Extracted recommendation:', recommendation);

    return {
      rowIndex: 0, // Will be set by the service
      originalText,
      translatedText,
      forwardQualityScore,
      evaluatorFeedback,
      backTranslation,
      finalQualityScore,
      comparatorFeedback: comparatorResponse,
      recommendation
    };
  }

  private fillPrompt(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }

  private extractScore(text: string): number {
    console.log('[TranslationEngine] Extracting score from text (first 500 chars):', text.substring(0, 500));
    const scoreMatch = text.match(/Score:\s*(\d+)/i);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1], 10);
      console.log('[TranslationEngine] Found score:', score);
      return Math.min(100, Math.max(0, score));
    }
    console.warn('[TranslationEngine] No score found in output, using default 50');
    return 50; // Default score if not found
  }

  private extractRecommendation(text: string): 'ACCEPT' | 'REVISE' {
    const recommendationMatch = text.match(/Recommendation:\s*(ACCEPT|REVISE)/i);
    if (recommendationMatch) {
      return recommendationMatch[1].toUpperCase() as 'ACCEPT' | 'REVISE';
    }
    return 'ACCEPT'; // Default to accept if not found
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
