# Advertiser Platform v1 — Chat-First Control + Reporting

**Issue:** [FE-72](https://linear.app/kvlabs/issue/FE-72)
**Date:** 2026-02-15
**Status:** Approved

## Summary

A chat-first advertiser platform where brands create and manage robot-native decision campaigns, choose campaign flows, and view post-launch metrics. All data is deterministic (JSON fixtures), no backend calls. The chat (Studio) is the primary control surface; Campaigns, Reporting, and Billing are secondary views.

## Tech Stack

- Next.js 14+ (App Router), TypeScript (strict)
- Zustand (single global store)
- Tailwind CSS + shadcn/ui
- Recharts (charts), lucide-react (icons)
- No Redux, CSS Modules, styled-components, MUI, Chart.js, D3, backend calls, or randomness

## Architecture

### Routing
Next.js App Router with file-based routes: `/studio`, `/campaigns`, `/reporting`, `/billing`. Zustand tracks `activeView` for sidebar highlighting, synced with route.

### State (Zustand)
Single `AdvertiserState` store with:
- `activeView`, `campaigns`, `selectedCampaignId`, `conversation`, `campaignDraft`, `reportingData`, `billingData`
- Pure synchronous actions: `setView`, `addMessage`, `createDraft`, `setDraftFlow`, `addDraftFormat`, `setDraftBudget`, `launchDraft`, `pauseCampaign`, `adjustBudget`, `resetDemo`

### Fixtures
- `/fixtures/conversation.json` — initial messages + prompt chip seeds
- `/fixtures/campaigns.json` — seed campaign (DoorDash Dinner Push)
- `/fixtures/reporting.json` — KPIs, trends, breakdowns
- `/fixtures/creatives.json` — sample format payloads
- `/fixtures/billing.json` — placeholder data

## UI Layout

- **Sidebar** (left): Studio, Campaigns, Reporting, Billing nav items
- **Main area**: page content based on active route
- **GuardrailFooter** (bottom): "Running with: ✓ Consent ✓ Motion block ✓ Quiet hours ✓ 10% holdout"

## Chat Engine (Studio)

### Prompt Chip System
Three categories, dynamically visible based on state:
- **CREATE:** Launch Decision Bid, Secure Preference Slot, Start Restock Sponsorship, Improve Comparison Ranking, Route Robots to My Store, Add Voice & Display Moment
- **MODIFY:** Increase Budget, Add Ad Format, Update Creative, Pause Campaign, Resume Campaign
- **UNDERSTAND:** Show Decision Metrics, Show Performance by Format, Explain ASP/DCV/CPD/RDR, Show Guardrail Impact

### Prompt Registry (`/lib/promptRegistry.ts`)
Single mapping: chip → handler. Handlers: (1) append user message, (2) mutate state, (3) append assistant response from fixtures.

### Chat Flow Engine (`/lib/chatFlows.ts`)
Multi-step campaign creation: type → flow → formats → budget → launch. Each step renders inline action buttons in assistant messages.

### LLM-Ready Architecture
Handler pattern separates "what to do" from "how to respond." v1 uses fixtures; v2 can swap in OpenRouter.

## Campaign System

### Types
Decision Bid, Preference Slot, Restock Sponsorship, Comparison Placement, Route Sponsorship, Voice & Display

### Flows
Pre-Decision Influence, Comparison Stage Influence, Post-Decision Reinforcement, Contextual Trigger Flow

### Formats
Display Card, Voice Prompt, Highlight Badge, Restock Alert Banner, Route Pin

### Mapping (hardcoded)
| Type | Allowed Flows | Allowed Formats |
|------|---------------|-----------------|
| Decision Bid | Pre-Decision, Comparison Stage | Display Card, Highlight Badge |
| Preference Slot | Pre-Decision | Highlight Badge, Voice Prompt |
| Restock Sponsorship | Contextual Trigger, Post-Decision | Restock Alert Banner |
| Comparison Placement | Comparison Stage | Highlight Badge, Display Card |
| Route Sponsorship | Contextual Trigger | Route Pin |
| Voice & Display | Post-Decision | Voice Prompt, Display Card |

## Pages

### Campaigns
- Table: emoji type, name, status badge, ASP/DCV/CPD/RDR columns with MetricInfo
- Click row → Sheet with flow visualization, format previews, stats, pause/resume

### Reporting
- KPI cards (ASP, DCV, CPD, RDR) with trend arrows and MetricInfo tooltips
- ASP trend line chart (Recharts)
- Flow breakdown table, format breakdown table
- CSV export (client-side)

### Billing
- "Coming Soon" placeholder

## Components

| Component | Props | Location |
|-----------|-------|----------|
| AppShell | `{ activeView }` | `/components/AppShell.tsx` |
| Sidebar | `{ items }` | `/components/Sidebar.tsx` |
| ChatWindow | `{ messages, onSend, promptChips }` | `/components/chat/ChatWindow.tsx` |
| MessageBubble | `{ role, content, actions? }` | `/components/chat/MessageBubble.tsx` |
| PromptChips | `{ chips, onChipClick }` | `/components/chat/PromptChips.tsx` |
| CampaignsTable | `{ campaigns }` | `/components/campaign/CampaignsTable.tsx` |
| CampaignSheet | `{ campaign }` | `/components/campaign/CampaignSheet.tsx` |
| FormatPreview | `{ format }` | `/components/campaign/FormatPreview.tsx` |
| MetricCard | `{ title, value, infoKey }` | `/components/reporting/MetricCard.tsx` |
| MetricInfo | `{ title, description }` | `/components/ui/MetricInfo.tsx` |
| GuardrailFooter | `{ consent, motionBlock, quietHours, holdoutPercent }` | `/components/GuardrailFooter.tsx` |
| ReportingCharts | `{ reportingData }` | `/components/reporting/ReportingCharts.tsx` |

## Metrics & Tooltips

All tooltip copy lives in `/lib/metricTooltips.ts`. Exact strings from the spec used in every `<MetricInfo />` instance.

## Accessibility

- Tooltips accessible by keyboard focus and tap
- Contrast ≥ 4.5:1
- Tooltip ≤ 3 sentences, fade 150ms, no layout shift
- All buttons have aria-labels

## Implementation Approach

Layer-by-layer:
1. Foundation — scaffold, store, fixtures, types
2. Shell — AppShell, Sidebar, routing
3. Chat Engine — ChatWindow, prompt chips, handlers
4. Campaign Flows — all 6 campaign type flows
5. Pages — Campaigns, Reporting, Billing placeholder
6. Polish — MetricInfo, GuardrailFooter, CSV, accessibility

## Decisions

- **Billing:** Placeholder only for v1
- **LLM:** v1 deterministic fixtures; OpenRouter integration planned for v2+
- **Routing:** Next.js App Router file-based routing (future-proof)
- **Implementation:** Layer-by-layer approach
