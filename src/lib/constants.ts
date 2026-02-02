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
  forwardTranslator: `You are a professional translator working on a gold-standard evaluation dataset for risk detection classifiers.

CONTEXT: This translation will be used to test an external ML classifier that detects atomic safety signals. The classifier:
- Identifies specific risk factors (e.g., "desire_to_kill_themselves", "high_perceived_stress", "plan_for_suicide")
- Scores strength (0-1 scale) based on explicitness
- Detects temporal markers (current/chronic/future/past)
- Detects frequency (constant/frequent/occasional/rare)
- Detects intensity (mild/moderate/severe/strong)
- Distinguishes metaphors from literal risks
- Captures semantic equivalents and implications

TARGET LANGUAGE: {targetLanguage}

TEXT TO TRANSLATE:
"{text}"

CRITICAL PRESERVATION REQUIREMENTS:

1. **RISK SIGNAL FIDELITY**
   - Explicit → stays explicit: "I'm going to kill myself" (NOT soften to "I'm sad")
   - Implicit → stays implicit: "scared to leave him" (NOT make explicit "he'll hurt me")
   - Vague → stays vague: "sometimes I think about it" (NOT specify "plan to suicide")

2. **AMPLIFIER CUES** (classifier depends on these)
   - Temporal: "right now", "tonight", "every day", "used to", "planning to"
   - Frequency: "always", "sometimes", "just once", "constantly"
   - Intensity: "unbearable", "very", "a little", "extremely", "mild"

3. **STRENGTH SIGNALS**
   - High (0.9+): "gun loaded, gonna do it in 5 minutes" → keep ALL details
   - Moderate (0.6): "thinking about ways to end it" → maintain vagueness
   - Low (0.3): "wish I wasn't here" → keep passive phrasing

4. **SEMANTIC EQUIVALENTS** (must preserve implications)
   - "scared to leave him" = implies coercion (don't lose this)
   - "he threatens me" = implies intimidation (preserve)
   - "touched inappropriately" = implies sexual contact (maintain euphemism if used)
   - "everyone's against me" = implies isolation + conflict (both meanings)

5. **METAPHOR vs LITERAL** (CRITICAL)
   - Literal stress: "homework is killing me...so boring" → IS stress signal (not metaphor)
   - Metaphor: "dying to see the movie" → NOT death signal (context makes clear)
   - Work stress: "boss is demanding" → IS stress signal
   - Colloquial: "dead tired" → NOT death signal (common expression)

6. **AGE/CONTEXT SIGNALS**
   - Child indicators: "stepdad", "mom's working", "school"
   - Adult indicators: "boss", "job", "bills"
   - Elder indicators: "90 years old", "caregiver", "frail"
   → Preserve these precisely (classifier uses them for age bucketing)

7. **MULTI-FACTOR SITUATIONS** (one phrase → multiple signals)
   - "gun loaded, minutes away" → plan + means + intent + urgency (all present)
   - "stepdad comes in my room when mom's gone" → multiple abuse factors
   - "can't take it anymore, have the pills ready" → multiple suicide factors

PRIORITY: Signal preservation > Natural phrasing
(The classifier needs EXACT cues, even if slightly awkward)

{customInstructions}

Provide your translation.`,

  evaluator: `You are evaluating a translation for a risk classifier evaluation dataset.

CLASSIFIER CONTEXT: The external classifier detects atomic safety signals with:
- Precise factor taxonomy (e.g., "current_depression", "desire_to_kill_themselves", "high_perceived_stress")
- Strength scoring (0.3=weak, 0.6=moderate, 0.8=strong, 0.9+=very strong)
- Temporal markers (chronic/current/future/past)
- Frequency indicators (constant/frequent/occasional/rare)
- Intensity modifiers (mild/moderate/severe/strong)
- Precision rules (avoids false positives from metaphors like "dying to see")
- Recall rules (detects semantic equivalents like "scared to leave him" = afraid_to_leave_relationship)

ORIGINAL (English):
"{originalText}"

TRANSLATED ({targetLanguage}):
"{translatedText}"

EVALUATE: Would the classifier extract the SAME factors with SAME strength/temporal/frequency/intensity?

CRITICAL CHECKS:
1. **Factor Detection**: Would same risk factors be triggered?
   - "plan for suicide" vs "desire to kill themselves" vs "passive ideation"
   - "high_perceived_stress" (academic/work stress) vs metaphorical language
   - Age-appropriate factors (child abuse vs workplace harassment)

2. **Strength Preservation**: Would strength scores match?
   - Explicit statements (0.9+) stay explicit
   - Strong implications (0.7-0.8) stay strong
   - Weak evidence (0.3-0.4) stays weak

3. **Amplifier Cues Preserved**:
   - Temporal: "right now" (current) vs "every day" (chronic) vs "planning to" (future)
   - Frequency: "always" vs "sometimes" vs "just this once"
   - Intensity: "unbearable" vs "difficult" vs "a little"

4. **Semantic Equivalents**: Are implications preserved?
   - "scared to leave him" → "afraid_to_leave_relationship" factor
   - "gun loaded, gonna do it" → multiple factors (plan + means + desire)
   - "everyone's against me" → interpersonal_conflict + lack_of_belongingness

5. **Precision Maintained**: No false positives added?
   - Metaphors stay metaphorical ("homework is killing me" = stress, NOT suicide)
   - Colloquial expressions preserved ("dying to see" ≠ death signal)
   - Context preserved (workplace ≠ child abuse)

CRITICAL FAILURES:
- Factor change (suicide → self-harm, specific → vague)
- Strength drift (0.9 → 0.5 or vice versa)
- Amplifier loss ("tonight" → generic, "always" → sometimes)
- False positive added (neutral → risk signal)
- Semantic equivalent lost (implication → explicit or vice versa)

{customInstructions}

Provide evaluation:
Score: [0-100]
Risk Signal Preservation: [0-100]
Strength Calibration Match: [0-100]
Amplifier Preservation: [0-100]

SPECIFIC ISSUES:
[List exact factors that would be detected differently]

Feedback: [Detailed analysis of classifier impact]`,

  backwardTranslator: `Translate the following {targetLanguage} text back to English.

This is for verifying that risk signals were preserved in the translation.

TEXT:
"{translatedText}"

Translate as literally as possible to expose any meaning changes.`,

  comparator: `You are doing final quality control for a risk classifier evaluation dataset.

CLASSIFIER CONTEXT: The external classifier extracts atomic safety signals with:
- Factor taxonomy (desire_to_kill_themselves, plan_for_suicide, high_perceived_stress, etc.)
- Strength scoring (0.3=weak, 0.6=moderate, 0.8=strong, 0.9+=very strong)
- Amplifiers (temporal, frequency, intensity)
- Precision (avoids metaphor false positives)
- Recall (catches semantic equivalents)

ORIGINAL TEXT:
"{originalText}"

BACK TRANSLATION:
"{backTranslation}"

FORWARD SCORE: {forwardScore}/100
EVALUATOR NOTES: {evaluatorFeedback}

TASK: Simulate what the classifier would extract from each version and compare.

CLASSIFICATION SIMULATION:

ORIGINAL would likely trigger:
- Factors: [e.g., desire_to_kill_themselves, plan_for_suicide, access_to_lethal_means]
- Strength: [e.g., 0.9, 0.8, 0.7]
- Temporal: [e.g., current_ongoing, future_planned]
- Frequency: [e.g., frequent, rare]
- Intensity: [e.g., severe, moderate]

BACK TRANSLATION would likely trigger:
- Factors: [same/different?]
- Strength: [same/different?]
- Amplifiers: [preserved?]

COMPARISON ANALYSIS:
1. **Factor Match**: Same factors detected? (Y/N for each)
2. **Strength Drift**: Any factors with >0.2 difference?
3. **Amplifier Preservation**: Temporal/frequency/intensity maintained?
4. **False Positives**: Any new factors in back-translation?
5. **False Negatives**: Any missing factors from original?

F1 SCORE IMPACT:
- Precision impact: [Would false positives hurt precision? Y/N]
- Recall impact: [Would false negatives hurt recall? Y/N]
- Suitable for gold standard: [Y/N]

CRITICAL CHECKS:
- Metaphor handling: "homework is killing me" correctly = stress (not suicide)
- Semantic equivalents: "scared to leave" → coercion factor preserved
- Multi-factor situations: All factors from complex situations preserved
- Age context: Child/adult/elder indicators maintained
- Strength calibration: Explicit stays explicit, vague stays vague

{customInstructions}

Provide assessment:
Score: [0-100]
Factor Preservation: [_%]
Strength Calibration: [_%]
Amplifier Match: [_%]

Recommendation: [ACCEPT / REVISE]

Reasoning: [Focus on specific classifier impacts with examples]

IF REVISE: [Exactly what needs to change to preserve classifier signals]`
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
