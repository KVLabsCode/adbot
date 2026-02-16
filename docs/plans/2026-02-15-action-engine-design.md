# FE-73: AI-First Action Engine Design

## One-Sentence Summary

A deterministic action registry where prompt chip clicks bypass the AI API, directly mutate Zustand state, push ActionEvents to history, and render inline UI blocks (flow diagrams, format previews, launch banners) in the chat stream.

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Action execution model | Fully deterministic | Instant feedback, no API latency for actions |
| Flow diagram style | Connected nodes | Clean, modern, fits shadcn aesthetic |
| Preview placement | Inline in chat stream | Feels like AI "assembled" the campaign |
| Metrics source | Random from realistic ranges | Different each run, always plausible |
| Architecture | Action Registry pattern | Clean separation, maps to Linear issue model |

---

## Data Model

### ActionEvent

```typescript
type ActionType =
  | "CREATE_CAMPAIGN"
  | "SET_FLOW"
  | "ADD_FORMAT"
  | "SET_BUDGET"
  | "LAUNCH_CAMPAIGN"
  | "PAUSE_CAMPAIGN"
  | "RESUME_CAMPAIGN"
  | "INCREASE_BUDGET";

interface ActionEvent {
  id: string;          // "action-1", "action-2", etc.
  type: ActionType;
  payload: Record<string, unknown>;
  timestamp: number;
}
```

### Extended ChatMessage

```typescript
type MessageType =
  | "text"
  | "flow-preview"
  | "format-preview"
  | "launch-banner"
  | "guardrail-check"
  | "metrics-reveal";
```

`ChatMessage` gains optional `type` (defaults to "text") and `metadata` fields.

### Zustand Additions

- `actionHistory: ActionEvent[]`
- `actionCounter: number`
- `pushAction(type, payload): ActionEvent`

---

## Action Registry

File: `src/lib/actionRegistry.ts`

Maps each `ActionType` to a handler that:
1. Mutates store state via existing actions
2. Pushes an ActionEvent
3. Appends structured assistant message(s) and inline UI blocks

Prompt chips reference action types. Freeform text still goes to OpenRouter API.

### Prompt Chip Flow (contextual visibility)

1. Initial: "Launch a new campaign" chips (one per campaign type)
2. After CREATE_CAMPAIGN: flow selection chips appear
3. After SET_FLOW: format selection chips appear
4. After ADD_FORMAT: budget chips appear
5. After SET_BUDGET: "Launch Campaign" chip appears

Each chip's `visibleWhen` checks draft state.

---

## New UI Components

### CampaignFlowPreview

- 4 horizontal connected nodes with arrow connectors
- Stages: Context Detected -> Robot Evaluates -> Brand Influence -> Decision Executed
- Active node: primary color border + background tint + 150ms CSS fade
- Flow-to-stage mapping:
  - CONTEXTUAL_TRIGGER -> node 1
  - PRE_DECISION -> node 2
  - COMPARISON_STAGE -> node 3
  - POST_DECISION -> node 4

### FormatPreview (inline)

Reuses existing FormatPreview component wrapped in a chat message container.

### LaunchBanner

Full-width green banner: "Campaign Live Across 2,140 AdPods" with pulse animation.

### GuardrailCheck

4 checkmarks: Consent enforced, Motion blocked, Quiet hours respected, 10% holdout active.

### MetricsReveal

Compact 4-metric card (ASP, DCV, CPD, RDR) with staggered 150ms fade-in.

### Sidebar Badge

Active campaign count badge on the Campaigns nav item.

### MessageBubble Extension

Switch on `message.type` to render inline components for non-text messages.

---

## Campaign Lifecycle

### Launch Sequence

1. LAUNCH_CAMPAIGN handler generates realistic metrics
2. Calls `store.launchDraft()` (draft -> campaigns array)
3. Pushes ActionEvent
4. Appends: structured text -> launch banner -> guardrail check -> metrics reveal
5. No route change, no reload

### AI Activity Log

- New section in CampaignSheet
- Filters actionHistory for events related to selected campaign
- Timeline entries with human-readable labels and timestamps

### Campaigns Page

- Immediately reflects new campaigns via Zustand reactivity
- Shows type emoji, name, status badge, metrics, flow

---

## Constraints

- No async simulation delays
- No fake loading spinners
- All IDs from incremental counters
- All metrics from fixture or realistic random ranges
- No API calls for action execution
- Strict TypeScript throughout
