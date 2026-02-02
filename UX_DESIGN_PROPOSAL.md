# UX Design Proposal: Clinical Psychology Translation with Agent Transparency

## Core Problems to Solve
1. Users can't see what agents are doing in real-time
2. No visibility into decision-making process
3. Missing clinical psychology domain expertise
4. No self-learning mechanism for quality improvement
5. Cultural context and clinical nuances not explicitly captured

## Proposed UX Changes

### 1. Agent Communication Timeline (New Component)
**Visual Design:**
```
┌─────────────────────────────────────────────────────────┐
│  Row 1/121: "I've been feeling depressed again..."     │
├─────────────────────────────────────────────────────────┤
│  ┌─ Forward Translator ────────────────────────┐       │
│  │  ⚡ Translating... (2.3s)                    │       │
│  │  📝 Result: "最近我又感到抑郁了..."            │       │
│  │  💭 Clinical terms detected: "depressed"     │       │
│  │  🌍 Cultural adaptation: Used formal tone     │       │
│  └──────────────────────────────────────────────┘       │
│                    ↓                                     │
│  ┌─ Clinical Evaluator ───────────────────────┐        │
│  │  🔍 Analyzing therapeutic accuracy... (1.8s) │       │
│  │  ✓ Clinical accuracy: 95/100                 │       │
│  │  ✓ Empathy preserved: Yes                    │       │
│  │  ⚠ Concern: "抑郁" vs "郁闷" - checking...    │       │
│  │  💬 Feedback: "Excellent preservation of..."  │       │
│  └──────────────────────────────────────────────┘       │
│                    ↓                                     │
│  ┌─ Back Translator ──────────────────────────┐        │
│  │  ⚡ Translating back... (2.1s)               │       │
│  │  📝 Result: "I've been feeling depressed..." │       │
│  │  ✓ Semantic match: 98%                       │       │
│  └──────────────────────────────────────────────┘       │
│                    ↓                                     │
│  ┌─ Clinical Comparator ──────────────────────┐        │
│  │  🔬 Final quality check... (2.0s)            │       │
│  │  ✓ Clinical fidelity: 96/100                 │       │
│  │  ✓ Cultural appropriateness: Excellent       │       │
│  │  ✓ Therapeutic tone: Maintained              │       │
│  │  ✅ RECOMMENDATION: ACCEPT                    │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### 2. Split-Screen Layout
**Left Panel: Configuration + Controls**
- Dataset selector
- Language + Clinical specialty dropdown (Depression, Anxiety, Trauma, etc.)
- Custom clinical context field
- Agent prompt editor (advanced)

**Center Panel: Live Agent Activity**
- Real-time agent conversation timeline
- Expandable agent reasoning
- Clinical term highlighting
- Cultural adaptation notes

**Right Panel: Results + Quality Metrics**
- Translation results
- Quality scores with explanations
- Clinical fidelity metrics
- Cultural context notes
- User feedback interface

### 3. New Components Needed

#### A. AgentConversationTimeline.tsx
Shows real-time agent communication with:
- Agent avatars/icons
- Thinking indicators (animated)
- Response bubbles
- Time elapsed
- Confidence scores
- Clinical flags

#### B. ClinicalContextPanel.tsx
- Clinical specialty selector (Depression, Anxiety, PTSD, etc.)
- Tone selector (Formal, Warm, Directive, Reflective)
- Cultural background inputs
- Age group consideration
- Therapeutic approach (CBT, Psychodynamic, etc.)

#### C. QualityFeedbackWidget.tsx
- Star rating (1-5)
- Specific feedback categories:
  - Clinical accuracy
  - Cultural appropriateness
  - Emotional tone
  - Therapeutic effectiveness
- Suggested improvements field
- "Save as training example" checkbox

#### D. ClinicalTermGlossary.tsx
- Auto-built glossary from translations
- Shows: Original term → Translation → Context
- User can add/edit translations
- Version history
- Frequency of use

### 4. Enhanced Progress Display

Instead of simple progress bar:
```
Translation Progress: 45/121 (37%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Row: "I feel anxious about the future"
Agent Active: Clinical Evaluator (Step 2/4)
Time Elapsed: 8m 23s
Estimated Remaining: 12m 15s

Quality Metrics (Rolling Average):
├─ Clinical Accuracy:    94/100 ⭐⭐⭐⭐⭐
├─ Cultural Fit:         92/100 ⭐⭐⭐⭐⭐
├─ Emotional Tone:       96/100 ⭐⭐⭐⭐⭐
└─ Acceptance Rate:      89% (40 ACCEPT, 5 REVISE)

🏥 Clinical Terms Learned: 23
🌍 Cultural Adaptations: 15
```

### 5. Interactive Agent Cards

Each agent shows:
- **Status**: Idle | Thinking | Complete
- **Current Action**: "Evaluating clinical accuracy..."
- **Time**: 2.3s elapsed
- **Confidence**: 95% confident
- **Key Points**: Bullet list of what it's considering
- **Flags**: 🚩 Issues detected, ✅ All clear

### 6. Clinical Dashboard (New Tab)

Shows aggregate insights:
```
📊 Translation Analytics

Session Stats:
├─ Rows translated: 121
├─ Average quality: 94/100
├─ Time taken: 18m 32s
└─ Cost: $0.12

Clinical Insights:
├─ Most common terms: "depression" (23), "anxiety" (18)
├─ Challenging translations: 7 requiring iteration
├─ Cultural adaptations: 45 instances
└─ Therapeutic tone: 98% maintained

Quality Trends:
[Line graph showing quality over time]

Term Glossary:
├─ "depressed" → "抑郁" (used 23x, 96% accepted)
├─ "anxious" → "焦虑" (used 18x, 94% accepted)
└─ "trauma" → "创伤" (used 12x, 91% accepted)
```

## Visual Design System

### Color Coding
- 🟦 **Blue**: Forward Translator (Action/Translation)
- 🟨 **Yellow**: Evaluator (Analysis/Caution)
- 🟪 **Purple**: Back Translator (Verification)
- 🟩 **Green**: Comparator (Decision/Success)
- 🟥 **Red**: Errors/Critical Issues
- 🟧 **Orange**: Warnings/Iterations

### Icons
- ⚡ Working
- 🔍 Analyzing
- ✓ Success
- ⚠ Warning
- 💭 Thinking
- 🏥 Clinical term
- 🌍 Cultural adaptation
- 💬 Feedback
- 🔬 Quality check

### Animation
- Pulsing dots while agent is thinking
- Smooth transitions between agent steps
- Progress bar fills with gradient
- Success checkmark animation
- Celebration animation on completion

## Information Architecture

```
Main View
├─ Header
│  ├─ App name + logo
│  ├─ Settings (API key, preferences)
│  └─ Clinical mode toggle
│
├─ Three-Column Layout
│  ├─ Left: Configuration (30%)
│  │  ├─ Dataset management
│  │  ├─ Language selection
│  │  ├─ Clinical context
│  │  └─ Advanced settings
│  │
│  ├─ Center: Live Activity (40%)
│  │  ├─ Agent conversation timeline
│  │  ├─ Current row context
│  │  └─ Real-time metrics
│  │
│  └─ Right: Results (30%)
│     ├─ Completed translations
│     ├─ Quality feedback
│     └─ Clinical glossary
│
└─ Bottom Panel (Collapsible)
   ├─ All jobs list
   ├─ Analytics dashboard
   └─ Learning insights
```

## Mobile/Tablet Responsive

- Stack panels vertically
- Agent timeline becomes scrollable
- Swipeable tabs for different views
- Collapsible sections
- Priority: Show current agent activity first

## Accessibility

- Screen reader announcements for agent activity
- Keyboard navigation through timeline
- High contrast mode
- Font size controls
- ARIA labels on all interactive elements

## Performance Considerations

- Virtualized scrolling for long agent timelines
- Lazy loading of completed translations
- Real-time updates via polling (2s interval)
- Optimistic UI updates
- Background processing indicators

## User Testing Goals

1. Can users understand what each agent is doing?
2. Do users trust the translation quality more?
3. Can users identify when to provide feedback?
4. Is the clinical context clear and actionable?
5. Does the learning loop feel transparent?
