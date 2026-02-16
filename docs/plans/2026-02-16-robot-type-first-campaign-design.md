# FE-76: Robot-Type-First Campaign Architecture

**Status:** Approved
**Date:** 2026-02-16

---

## One-Sentence Summary

Redesign Launch Campaign to begin with robot type selection (4 categories), derive campaign subtypes from robot capabilities, and educate users with visual simulations before setup.

## Problem

The current launch flow starts with 6 flat campaign types. Users don't understand *why* a campaign type exists or *which robots* it targets. FE-76 introduces Robot Type as the top-level concept, making the relationship between physical robot infrastructure and advertising clear.

## Architecture

### Layer-on-Top Approach

Add `RobotType` as a new top-level enum that maps to existing `CampaignType` values (now called "subtypes" in the UI). All downstream logic (store, actionRegistry, reporting, campaigns page) continues using `CampaignType` internally.

### New Hierarchy

```
Robot Type → Capabilities → Campaign Subtype (= CampaignType) → Ad Format → Strategy → Budget
```

## Data Model

### New Types

```typescript
enum RobotType {
  DELIVERY = "delivery",
  RETAIL = "retail",
  HOME = "home",
  HOSPITALITY = "hospitality",
}
```

### CampaignDraft Extension

```typescript
interface CampaignDraft {
  robotType?: RobotType;  // NEW
  name?: string;
  type?: CampaignType;    // subtype
  flow?: FlowType;
  formats: FormatContent[];
  budget?: number;
  strategyConfig?: Record<string, unknown>;  // NEW — subtype-specific
}
```

### Mapping Tables (campaignMappings.ts)

#### Robot Type → Subtypes
| Robot Type | Campaign Subtypes |
|---|---|
| Delivery | Decision Bid, Route Sponsorship, Voice & Display |
| Retail | Comparison Placement, Preference Slot, Restock Sponsorship |
| Home | Restock Sponsorship, Voice & Display, Preference Slot |
| Hospitality | Decision Bid, Comparison Placement, Voice & Display |

#### Robot Type Metadata
Each robot type has: label, emoji, description, capabilities[], advantages[].

- **Delivery** (🚚): On-device display, Voice output, Route awareness, Location-based triggers, Delivery moment screen
- **Retail** (🏬): Large comparison screens, Product search & ranking, Inventory detection, Voice assistance
- **Home** (🏠): Voice prompts, Small display, Inventory awareness, Subscription suggestions
- **Hospitality** (🏢): Screen surfaces, Greeting voice, Contextual upsells

#### Subtype Education Content
Each CampaignType gets education metadata keyed by the robot type context:
- Visual description (for SVG illustration)
- What It Does (plain language)
- Where It Acts (pipeline stage)
- Best For (2-3 use cases)
- Metrics Impacted

## Launch Flow (5 Steps)

### Step 1 — Robot Type Selector
Full-screen grid of 4 cards. Each card: SVG illustration, name, description, capability badges, advertiser advantages. Click selects and advances.

### Step 2 — Subtype Education
Shows derived subtypes for the selected robot type (2-3 cards). Each card includes:
- Illustrated visual simulation (SVG/CSS)
- Plain-language explanation
- CampaignFlowPreview (reused) showing influence stage
- "Best For" tags
- "Select Subtype" button

Back navigation to Step 1.

### Step 3 — Ad Format Selection
Reuses IntegratedFormatGallery. Formats derived from Robot Type + Subtype combination using `flowToFormats[campaignType]`. Each format shows robot-context preview via RobotSurfacePreview.

### Step 4 — Strategy Configuration
Subtype-specific controls replace the generic optimization strategy:

| Subtype | Controls |
|---|---|
| Decision Bid | Influence stage, Optimization objective (selection rate / value / balanced), Aggressiveness (conservative / moderate / aggressive) |
| Route Sponsorship | Radius (1mi / 3mi / 5mi), Priority (standard / preferred / exclusive) |
| Restock Sponsorship | Trigger threshold (low / critical / any change), Frequency (daily / weekly / on-demand) |
| Comparison Placement | Position (top / featured / inline), Highlight intensity (subtle / standard / bold) |
| Preference Slot | Duration (7 days / 14 days / 30 days), Refresh frequency (daily / weekly) |
| Voice & Display | Voice tone (neutral / enthusiastic / premium), Display timing (immediate / delayed / on-interaction) |

Budget selection integrated into this step (same $10K/$15K/$25K/$50K options).

### Step 5 — Review
Updated CampaignReview showing: Robot Type, Campaign Subtype, Influence Stage, Formats, Strategy Config, Budget. "You Control" / "Kovio Handles" sections. Launch CTA.

## Components

| Component | Action |
|---|---|
| `RobotTypeSelector.tsx` | NEW — 4 robot cards with SVG illustrations |
| `SubtypeEducation.tsx` | NEW — Deep education per subtype |
| `SubtypeStrategyConfig.tsx` | NEW — Subtype-specific configuration + budget |
| `LaunchFlow.tsx` | REWRITE — 5-step orchestration |
| `CampaignReview.tsx` | MODIFY — Show robot type, strategy config |
| `CampaignSetupFlow.tsx` | REMOVE — Replaced by new components |
| `CampaignTypeSelector.tsx` | REMOVE — Replaced by RobotTypeSelector + SubtypeEducation |
| `campaignMappings.ts` | EXTEND — All robot type mappings |
| `types/index.ts` | EXTEND — RobotType, strategyConfig |
| `store/index.ts` | EXTEND — setDraftRobotType, setDraftStrategyConfig |

## Deterministic Rules

- Robot types: static enum
- Capability map: hardcoded
- Subtype derivation: hardcoded lookup
- Format availability: derived from existing flowToFormats
- All visuals: local SVG/CSS
- No API calls
- No random generation (except launch metrics)

## Acceptance Criteria

1. Launch begins with Robot Type selection
2. Robot cards include SVG illustration + capabilities + advantages
3. Subtypes derived from robot capabilities
4. Each subtype has deep explanation + influence stage diagram
5. Formats embedded in launch flow with robot-context previews
6. Subtype-specific strategy configuration present
7. Back navigation works at every step
8. Fully deterministic
9. TypeScript strict passes (`npm run build`)
