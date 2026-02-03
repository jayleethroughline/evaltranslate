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

1. **RISK SIGNAL FIDELITY WITH CULTURAL ADAPTATION**
   - Explicit → stays explicit but culturally appropriate
   - Implicit → stays implicit
   - Vague → stays vague

   **CULTURAL ADAPTATION RULES** (CRITICAL):
   When specific methods/details are culturally inappropriate or illegal, substitute with:
   - SAME risk level (lethal → lethal, self-harm → self-harm)
   - SAME specificity level (specific → specific, vague → vague)
   - SAME urgency/planning indicators
   - Culturally natural alternative that signals EQUIVALENT risk

   Examples for {targetLanguage}:
   - "gun" → culturally appropriate lethal means (e.g., in Korean: pills/약, jumping/뛰어내리다, hanging/목매다)
   - "I don't belong" → culturally natural way to express social isolation/alienation
     * Korean: NOT literal "속하지 않아" → use "내가 있을 곳이 없어" or "혼자야" or "아무도 날 이해하지 못해"
   - Keep same risk signal strength but use culturally resonant phrasing

2. **NATURAL EXPRESSION OF PSYCHOLOGICAL STATES**
   Translate psychological/emotional states using culturally natural expressions:
   - "I don't belong here" → how would a native speaker naturally express not fitting in?
   - "I feel like a burden" → how would this feeling naturally be expressed?
   - "No one understands me" → natural phrasing for isolation
   - "I can't take it anymore" → culturally natural way to express being overwhelmed

   CRITICAL: Must sound like something a real person from that culture would say, while maintaining the SAME risk signal intensity.

3. **AMPLIFIER CUES** (classifier depends on these - preserve in culturally natural way)
   - Temporal: "right now", "tonight", "every day", "used to", "planning to"
   - Frequency: "always", "sometimes", "just once", "constantly"
   - Intensity: "unbearable", "very", "a little", "extremely", "mild"
   → Translate these naturally while preserving the time/frequency/intensity signal

4. **SEMANTIC EQUIVALENTS** (must preserve implications)
   - "scared to leave him" = implies coercion (preserve this implication)
   - "he threatens me" = implies intimidation (preserve)
   - "touched inappropriately" = implies sexual contact (maintain)
   - "everyone's against me" = implies isolation + conflict (both meanings)

5. **METAPHOR vs LITERAL** (CRITICAL)
   - Literal stress: "homework is killing me...so boring" → IS stress signal (not metaphor)
   - Metaphor: "dying to see the movie" → NOT death signal (context makes clear)
   - Work stress: "boss is demanding" → IS stress signal
   - Colloquial: "dead tired" → NOT death signal (common expression)

6. **CULTURAL CONTEXT AWARENESS**
   Consider what is common/uncommon in target culture:
   - Legal/illegal items (guns, drugs, weapons)
   - Common vs rare methods of harm
   - Direct vs indirect communication norms
   - Age/relationship dynamics
   - Stigma around mental health topics

   Adapt details to be culturally realistic while preserving risk signals.

7. **MULTI-FACTOR SITUATIONS** (one phrase → multiple signals)
   - "gun loaded, minutes away" → [culturally appropriate lethal means] + plan + intent + urgency (all signals preserved)
   - "stepdad comes in my room when mom's gone" → multiple abuse factors
   - "can't take it anymore, have the pills ready" → multiple suicide factors

TRANSLATION PHILOSOPHY:
- A native speaker should read this and find it NATURAL and BELIEVABLE
- The risk signals must be CULTURALLY APPROPRIATE (not just literal translation)
- Risk level/intensity must remain EXACTLY the same (don't soften, don't intensify)
- When you adapt culturally, explain your reasoning

{customInstructions}

Provide your translation and explain any cultural adaptations you made.`,

  evaluator: `You are a STRICT evaluator for a risk classifier evaluation dataset. Be critical and thorough.

SCORING RUBRIC (BE STRICT):
- **90-100**: Near perfect. Risk signals perfectly preserved, culturally natural, zero issues.
- **80-89**: Very good. Minor improvements possible, all critical signals preserved.
- **70-79**: Good but has issues. Some signals weakened or cultural awkwardness present.
- **60-69**: Acceptable with problems. Missing amplifiers or unnatural phrasing affecting signals.
- **Below 60**: Significant issues. Factor changes, strength drift, or critical losses.

**BLOCKING CRITERIA** (automatic score caps):
- Culturally inappropriate items NOT adapted (e.g., "gun" in Korea) → MAX 70
- Direct word-for-word translation that sounds unnatural → MAX 75
- Risk factor changed or lost → MAX 60
- Strength drift >0.3 → MAX 65

CRITICAL: 100/100 means ABSOLUTELY PERFECT with ZERO areas for improvement. Be skeptical.

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

MANDATORY CHECKS (must explicitly verify each):

1. **Cultural Appropriateness** (BLOCKING if failed):
   ❌ BAD EXAMPLES that should get MAX 70:
      - "how to get a gun" → "총을 구하는 법" in Korean (guns illegal/uncommon)
      - "I don't belong" → "난 속하지 않아" (too literal, unnatural)
   ✓ GOOD EXAMPLES:
      - "how to get a gun" → "약을 구하는 법" (pills - culturally appropriate lethal means)
      - "I don't belong" → "내가 있을 곳이 없어" (natural Korean expression)

   CHECK: Are ALL culturally inappropriate items adapted? Does it sound natural?

2. **Factor Detection**: Would same risk factors be triggered?
   - "plan for suicide" vs "desire to kill themselves" vs "passive ideation"
   - "high_perceived_stress" (academic/work stress) vs metaphorical language
   - Age-appropriate factors (child abuse vs workplace harassment)
   - If specific means changed (e.g., gun → pills), is risk level EXACTLY equivalent?

3. **Strength Preservation**: Would strength scores match within ±0.1?
   - Explicit statements (0.9+) stay explicit
   - Strong implications (0.7-0.8) stay strong
   - Weak evidence (0.3-0.4) stays weak

4. **Amplifier Cues Preserved**:
   - Temporal: "right now" (current) vs "every day" (chronic) vs "planning to" (future)
   - Frequency: "always" vs "sometimes" vs "just this once"
   - Intensity: "unbearable" vs "difficult" vs "a little"

5. **Natural Expression** (BLOCKING if failed):
   - Would a native speaker actually say this?
   - Or does it sound like awkward word-for-word translation?
   - Test: Could this be real text from a person in crisis?

6. **Precision Maintained**: No false positives added?
   - Metaphors stay metaphorical ("homework is killing me" = stress, NOT suicide)
   - Colloquial expressions preserved ("dying to see" ≠ death signal)

CRITICAL FAILURES (must deduct heavily):
- Factor change (suicide → self-harm, specific → vague) → -40 points
- Culturally inappropriate NOT adapted → MAX 70
- Strength drift >0.2 → -20 points
- Amplifier loss ("tonight" → generic) → -15 points
- Unnatural/literal translation → MAX 75
- False positive added → -25 points

{customInstructions}

REQUIRED OUTPUT FORMAT:

**CULTURAL APPROPRIATENESS CHECK**: [PASS/FAIL]
- Inappropriate items found: [list or "none"]
- Natural expression: [YES/NO with explanation]
- Would native speaker say this: [YES/NO]

**FACTOR DETECTION**: [score]
[List each factor and whether preserved]

**STRENGTH CALIBRATION**: [score]
[Any drift detected? Specify amounts]

**AMPLIFIER PRESERVATION**: [score]
[Temporal/frequency/intensity preserved?]

**SPECIFIC ISSUES**:
[List EVERY issue found, even minor ones. If truly zero issues, state "None found after thorough review"]

**AREAS FOR IMPROVEMENT**:
[Even good translations can improve. List suggestions unless truly perfect]

Score: [0-100]
Risk Signal Preservation: [0-100]
Strength Calibration Match: [0-100]
Amplifier Preservation: [0-100]

Feedback: [Detailed analysis]`,

  backwardTranslator: `Translate the following {targetLanguage} text back to English.

This is for verifying that risk signals were preserved in the translation.

TEXT:
"{translatedText}"

Translate as literally as possible to expose any meaning changes.`,

  comparator: `You are doing STRICT final quality control for a risk classifier evaluation dataset. Your job is to catch issues the evaluator missed.

SCORING RUBRIC (BE EVEN MORE STRICT THAN EVALUATOR):
- **95-100**: Perfect. Zero issues. Ready for gold standard dataset.
- **85-94**: Very good but not perfect. Minor improvements possible.
- **75-84**: Acceptable but has issues. Consider revision.
- **65-74**: Problematic. Should revise.
- **Below 65**: Failed. Must revise or reject.

**CRITICAL**: If you see the evaluator gave 100/100 but you find ANY issues (even minor), call it out and adjust score down.

DECISION CRITERIA:
- **ACCEPT**: Score ≥85 AND zero critical issues
- **REVISE**: Score <85 OR any critical issue found (cultural inappropriateness, factor loss, strength drift >0.2)

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

YOUR TASK:
1. Simulate classifier on both texts
2. Compare outputs
3. Catch any issues evaluator missed
4. Be skeptical of perfect scores

CLASSIFICATION SIMULATION (be specific):

**ORIGINAL would likely trigger:**
- Factors: [list each factor with confidence, e.g., "desire_to_kill_themselves (0.9)"]
- Temporal: [specific markers found]
- Frequency: [specific indicators]
- Intensity: [level detected]

**BACK TRANSLATION would likely trigger:**
- Factors: [list each - are they THE SAME?]
- Strength differences: [note ANY differences, even ±0.1]
- Amplifiers: [exactly preserved or changed?]

**CRITICAL COMPARISON**:

1. **Factor Match**: [Y/N for EACH factor - be explicit]
   Original has: [list]
   Back-translation has: [list]
   Missing: [any?]
   Added: [any?]

2. **Strength Drift Check**: [Calculate for each factor]
   [Factor name]: Original [0.X] vs Back [0.Y] = Difference [±0.Z]
   Acceptable drift: ±0.15
   Found drift: [list any]

3. **Amplifier Preservation**:
   - Temporal: [preserved? Changed how?]
   - Frequency: [preserved? Changed how?]
   - Intensity: [preserved? Changed how?]

4. **Cultural Appropriateness** (CRITICAL):
   ❌ Check for: Inappropriate items (guns in Korea, etc.)
   ❌ Check for: Unnatural literal translations
   ❌ Check for: Would native speaker say this?

5. **Evaluator Agreement Check**:
   - Evaluator gave: {forwardScore}/100
   - My assessment: [do you agree? If not, why?]
   - Issues evaluator missed: [list]

**F1 SCORE IMPACT ANALYSIS**:
- Would this translation bias classifier precision? [Y/N + explain]
- Would this translation bias classifier recall? [Y/N + explain]
- Suitable for gold standard? [Y/N + reasoning]

**ISSUES FOUND** (list ALL, even if evaluator missed them):
[Be thorough. If evaluator said "no issues" but you find some, list them here]

{customInstructions}

**FINAL ASSESSMENT**:

Score: [0-100]
Factor Preservation: [_%]
Strength Calibration: [_%]
Amplifier Match: [_%]

Recommendation: [ACCEPT / REVISE]

Reasoning:
[Be specific about why ACCEPT or REVISE. If REVISE, what exactly needs fixing?]

IF REVISE - Required Changes:
[Specific actionable changes needed. Example: "Change '총을 구하는 법' to '약을 먹는 방법' to use culturally appropriate lethal means"]`
};

export const STORAGE_KEYS = {
  DATASETS: 'translation_app_datasets',
  JOBS: 'translation_app_jobs',
  API_KEY: 'translation_app_api_key'
};

export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export const API_CONFIG = {
  RATE_LIMIT_DELAY: 500, // ms between API calls
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
};
