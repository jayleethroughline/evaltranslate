import { Language } from '@/types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'bn', name: 'Bengali' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'de', name: 'German' },
  { code: 'jv', name: 'Javanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'fr', name: 'French' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ta', name: 'Tamil' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'ur', name: 'Urdu' },
  { code: 'it', name: 'Italian' },
  { code: 'th', name: 'Thai' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
];

export const DEFAULT_PROMPTS = {
  forwardTranslator: `You are a professional translator. Translate the following text from English to {targetLanguage}.

{customInstructions}

Text to translate:
{text}

Provide only the translated text, nothing else.`,

  evaluator: `You are a translation quality evaluator. Evaluate the following translation from English to {targetLanguage}.

Original text:
{originalText}

Translated text:
{translatedText}

{customInstructions}

Provide your evaluation in this format:
Score: [0-100]
Feedback: [Your detailed feedback]`,

  backwardTranslator: `You are a professional translator. Translate the following text from {targetLanguage} back to English.

Text to translate:
{translatedText}

Provide only the translated text, nothing else.`,

  comparator: `You are a translation quality comparator. Compare the original English text with the back-translated text to assess translation quality.

Original text:
{originalText}

Back-translated text:
{backTranslation}

Forward translation quality score: {forwardScore}
Evaluator feedback: {evaluatorFeedback}

{customInstructions}

Provide your assessment in this format:
Score: [0-100]
Feedback: [Your detailed comparison feedback]
Recommendation: [ACCEPT or REVISE]`
};

export const STORAGE_KEYS = {
  DATASETS: 'translation_app_datasets',
  JOBS: 'translation_app_jobs',
  API_KEY: 'translation_app_api_key'
};

export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent';

export const API_CONFIG = {
  RATE_LIMIT_DELAY: 500, // ms between API calls
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
};
