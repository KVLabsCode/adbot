# FE-78: Creative Studio — Agentic Action Design

## One-Sentence Summary

A dedicated "Creatives" agentic action in Studio that allows advertisers to upload, generate, and manage robotic ad creatives through a guided format-specific creation flow, including automated compatibility correction and compliance validation before deployment.

---

## Architecture: Tab-Based Modular (Approach B)

Full overlay component (same pattern as LaunchFlow) with 4 tab panels, each as its own component. Format-specific builders are separate components.

### File Structure

```
src/components/creative/
  CreativeStudio.tsx              # Orchestrator + tab navigation (overlay)
  MyCreatives.tsx                 # Grid of existing creatives
  CreateNewFlow.tsx               # 3-step guided wizard
  AIGenerate.tsx                  # Template-based generation
  ValidationLog.tsx               # Validation history log
  FormatSelector.tsx              # Shared 7-card format grid (reused by Create New & AI Generate)
  RobotCompatibilitySelector.tsx  # Robot type checkbox selector with filtering
  CreativeDetailPanel.tsx         # Detail view for a single creative
  builders/
    DisplayCardBuilder.tsx
    VoicePromptBuilder.tsx
    HighlightBadgeBuilder.tsx
    RestockBannerBuilder.tsx
    RoutePinBuilder.tsx
    DialogueScriptBuilder.tsx
    GestureCueBuilder.tsx
src/components/formats/
  DialogueSurface.tsx             # New surface for humanoid dialogue preview
  GestureSurface.tsx              # New surface for gesture cue preview
src/lib/
  validationEngine.ts             # Deterministic validation rules
  creativeMappings.ts             # Format-to-robot compatibility, format metadata
src/fixtures/
  creative-templates.json         # AI Generate templates (per format + tone)
  creatives.json                  # Extended with all 7 format types + sample creatives list
```

---

## 1. Agentic Actions Update

Replace current 4 actions:

| # | Action | ID | Emoji | Description |
|---|--------|----|-------|-------------|
| 1 | Launch Campaign | `launch` | `🚀` | Build & deploy a new campaign |
| 2 | **Creatives** | `creatives` | `🎨` | Upload, create & manage ad assets |
| 3 | Reporting & Actions | `reporting` | `📈` | View metrics & manage campaigns |
| 4 | Insights | `insights` | `🧠` | AI-powered recommendations |

Performance removed — folded into Reporting & Actions.

---

## 2. Type System Additions

### FormatType enum (2 new values)

```typescript
HUMANOID_DIALOGUE_SCRIPT = "humanoid_dialogue_script"
GESTURE_CUE = "gesture_cue"
```

### FormatContent (new optional fields)

```typescript
dialogueLine?: string;
emotionalTone?: string;
contextTrigger?: string;
gestureName?: string;
gestureContext?: string;
```

### New types

```typescript
enum CreativeStatus {
  DRAFT = "draft",
  VALIDATED = "validated",
  NEEDS_CORRECTION = "needs_correction",
  LIVE = "live",
}

interface Creative {
  id: string;
  name: string;
  formatType: FormatType;
  robotTypes: RobotType[];
  status: CreativeStatus;
  content: FormatContent;
  validationResults: ValidationResult[];
  lastModified: string;
  campaignId?: string;
}

interface ValidationResult {
  category: "format_compatibility" | "length_constraints" | "safety_guardrails" | "robot_capability" | "visual_fit";
  passed: boolean;
  message: string;
  autoFixAvailable: boolean;
}

interface ValidationLogEntry {
  id: string;
  creativeId: string;
  creativeName: string;
  formatType: FormatType;
  timestamp: string;
  passed: boolean;
  results: ValidationResult[];
}
```

### Zustand store extensions

```typescript
// New state
creatives: Creative[];
creativeDraft: Partial<Creative> | null;
validationLog: ValidationLogEntry[];

// New actions
addCreative: (creative: Creative) => void;
updateCreative: (id: string, updates: Partial<Creative>) => void;
deleteCreative: (id: string) => void;
setCreativeDraft: (draft: Partial<Creative> | null) => void;
addValidationLog: (entry: ValidationLogEntry) => void;
```

---

## 3. Creative Studio Shell

- Full overlay (same z-index/pattern as LaunchFlow)
- Tab bar at top: My Creatives | Create New | AI Generate | Validation Log
- Close button (X) top-right
- Local state: `activeTab`
- Mounted when `showCreativeStudio === true`
- Toggle via `handleAgenticAction("creatives")`

---

## 4. Tab 1 — My Creatives

Grid of creative cards (2-col mobile, 3-col desktop).

Each card:
- Format type icon + label
- Compatible robot type emoji badges
- Status badge (Draft=gray, Validated=green, Needs Correction=amber, Live=blue)
- Last modified timestamp
- Click opens CreativeDetailPanel

---

## 5. Tab 2 — Create New (3-Step Guided Flow)

### Step 1: Select Ad Format Type

7-card grid (FormatSelector component, shared with AI Generate):

| Format | Emoji | Where It Appears | Supported Robots |
|--------|-------|-------------------|-----------------|
| Display Card | 📱 | Robot screen | Delivery, Retail, Home, Hospitality, Humanoid |
| Voice Prompt | 🔊 | Audio output | Delivery, Home, Hospitality, Humanoid, Event |
| Highlight Badge | ⭐ | Screen overlay | Retail, Hospitality |
| Restock Banner | 📣 | Screen alert | Retail, Home |
| Route Pin | 📍 | Navigation map | Delivery, Autonomous Vehicle |
| Humanoid Dialogue | 🗣 | Conversation | Humanoid |
| Gesture Cue | 🖐 | Physical gesture | Humanoid, Event |

### Step 2: Select Robot Compatibility

Checkbox selection: Delivery, Retail, Home, Hospitality, Humanoid.
Incompatible robots disabled based on format selection.

### Step 3: Format-Specific Builder

Routes to appropriate builder based on format. Common interface:

```typescript
interface BuilderProps {
  value: Partial<FormatContent>;
  onChange: (content: Partial<FormatContent>) => void;
  robotTypes: RobotType[];
}
```

---

## 6. Format-Specific Builders

### Display Card Builder
Fields: Headline (60), Body (120), CTA (20), Icon upload (mock)
Preview: ScreenSurface | Auto-checks: length, CTA presence, truncation

### Voice Prompt Builder
Fields: Script (200), Tone (Neutral/Enthusiastic/Premium), Duration (auto), Companion toggle
Preview: VoiceSurface | Auto-checks: length, brand repetition (max 2x), ends-with-question

### Highlight Badge Builder
Fields: Badge text (15)
Preview: ScreenSurface overlay | Auto-checks: length, caps warning

### Restock Banner Builder
Fields: Alert text (100), Urgency (Low/Medium/High)
Preview: ScreenSurface | Auto-checks: length, urgency language

### Route Pin Builder
Fields: Store Name (30), Offer Line (50), Distance Label (auto)
Preview: RoutingSurface | Auto-checks: lengths

### Humanoid Dialogue Script Builder
Fields: Dialogue line (150), Emotional tone (Friendly/Professional/Playful/Empathetic), Context trigger (Greeting/Product Inquiry/Checkout/Idle)
Preview: DialogueSurface (new) — conversation bubble simulation | Auto-checks: length, tone, trigger

### Gesture Cue Builder
Fields: Gesture name (Wave/Point/Present/Bow/Thumbs Up), Context (30 chars), Timing (Before/During/After Speech)
Preview: GestureSurface (new) — humanoid silhouette with gesture indicator | Auto-checks: context match, robot compat

---

## 7. Validation Engine

Pure deterministic function in `lib/validationEngine.ts`:

```typescript
function validateCreative(creative: Creative): ValidationResult[]
function autoFixCreative(creative: Creative, result: ValidationResult): Creative
```

5 categories:

| Category | Checks | Auto-fix |
|----------|--------|----------|
| Format Compatibility | Format matches robot surfaces | Remove incompatible robot |
| Length Constraints | All text within max | Truncate with "..." |
| Safety & Guardrails | No prohibited words, caps, brand repetition | Remove excess |
| Robot Capability | Robot supports format surface | Suggest compatible |
| Visual Fit | CTA present, contrast | Add default CTA |

Deployment gate: `status === "validated"` required to attach to campaign.

---

## 8. Tab 3 — AI Generate

4-step deterministic template flow:
1. Select Format (reuse FormatSelector)
2. Select Robot Type (filtered)
3. Select Brand Tone (Professional/Friendly/Bold/Playful)
4. Enter Offer (brand + detail)

Templates from `creative-templates.json`: 3-5 per format+tone with `{{brand}}` and `{{offer}}` placeholders.

User can edit after generation. Output enters standard creative pipeline (needs validation).

---

## 9. Tab 4 — Validation Log

Chronological list from `validationLog[]` in store.

Each entry: creative name, format type, timestamp, pass/fail, expandable details per category, link to creative.

---

## 10. Post-Validation Trust Badges

When validated, show:
```
✓ Compatible with [Robot Types]
✓ Passes screen constraints
✓ Guardrail compliant
```

---

## Deterministic Requirements

- All validation rules hardcoded
- No NLP moderation
- No AI inference
- Templates from fixtures only
- No API calls
- No randomness
- State stored in Zustand

---

## Acceptance Criteria

- [ ] Creatives appears as one of 4 agentic actions
- [ ] Creative Studio has 4 tabs
- [ ] Format-first creation flow with 7 formats
- [ ] Robot compatibility filtering works
- [ ] Format-specific builder UI renders for each format
- [ ] Live preview updates instantly
- [ ] Validation engine flags issues with specific messages
- [ ] Auto Fix works deterministically
- [ ] Creative cannot attach to campaign unless Validated
- [ ] TypeScript strict passes
