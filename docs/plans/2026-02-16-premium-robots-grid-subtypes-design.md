# FE-77: Premium Robot Categories & Visual Grid-Based Subtype Redesign

**Status:** Approved
**Date:** 2026-02-16

---

## One-Sentence Summary

Add 3 premium robot categories (Humanoid, Event, Autonomous Vehicle) with flagship styling, and redesign subtype selection from long scroll cards to a compact grid with "Learn More" modals.

## Part 1: New Premium Robot Types

### New RobotType enum values
- `HUMANOID` — Advanced humanoids in retail/hospitality/enterprise
- `EVENT` — Autonomous event robots at conferences/malls/airports
- `AUTONOMOUS_VEHICLE` — Self-driving delivery/transport vehicles

### Subtype Mappings (reusing existing CampaignTypes)
| Robot Type | Subtypes |
|---|---|
| Humanoid | Decision Bid, Comparison Placement, Voice & Display |
| Event | Decision Bid, Voice & Display, Preference Slot |
| Autonomous Vehicle | Route Sponsorship, Voice & Display, Decision Bid |

### Premium Tier
- Add `isPremium` flag to robot type metadata
- Premium types: Humanoid, Event, Autonomous Vehicle
- Standard types: Delivery, Retail, Home, Hospitality

## Part 2: RobotTypeSelector Redesign

Split robot type selector into two sections:

1. **"Premium Surfaces"** — displayed at top
   - Gradient border (primary-to-purple)
   - "Flagship Placement" badge on each card
   - Slight shadow elevation (`shadow-md`)
   - Same card layout (SVG illustration, capabilities, advantages)

2. **"Standard Robots"** — below premium section
   - Existing 4 robot types, unchanged card style

## Part 3: SubtypeEducation Grid Redesign

Replace long vertical education cards with compact 2x2 grid:

### Grid Card Contents
- Emoji + title
- Mini SVG visual (reuse existing simulation components)
- One-line summary
- Two buttons: "Select" (primary) + "Learn More" (outline)

### "Learn More" Modal
Opens with full subtype detail:
- Section 1: What It Does (plain language)
- Section 2: Influence Stage Diagram (CampaignFlowPreview)
- Section 3: Metrics Impacted
- Section 4: Strategic Best Use Cases

Content sourced from existing `subtypeEducation` data in campaignMappings.ts.

## Components

| Component | Action |
|---|---|
| `types/index.ts` | Add HUMANOID, EVENT, AUTONOMOUS_VEHICLE to RobotType |
| `campaignMappings.ts` | Add metadata for 3 new types + isPremium flag |
| `RobotTypeSelector.tsx` | Split Premium/Standard sections, premium card styling |
| `SubtypeEducation.tsx` | Rewrite to grid cards + Learn More modal |
| 3 new SVG illustrations | Humanoid, Event Robot, Autonomous Vehicle |

## Unchanged Components
- LaunchFlow.tsx (orchestration unchanged)
- SubtypeStrategyConfig.tsx
- CampaignReview.tsx
- store/index.ts
- actionRegistry.ts

## Acceptance Criteria
1. Premium section appears above standard robots
2. Premium cards have gradient border + "Flagship Placement" badge
3. All 3 new robot types have SVG illustrations, capabilities, advantages
4. Subtype selection is a 2x2 grid (not long scroll cards)
5. Each subtype grid card has "Learn More" modal with full education
6. Grid matches Launch Campaign visual style
7. Deterministic — no API calls, no randomization
8. TypeScript strict passes
