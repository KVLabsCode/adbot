# Kovio Live Network Demo Page — Design Doc

**Date:** 2026-03-24
**Route:** `/demo`
**Purpose:** High-fidelity investor demo simulating a live global robot ad network

---

## Goal

When an investor sees this page, they should think:
> "Wait… this already looks like a live network. This isn't a concept — it's inevitable."

---

## Architecture

### Route & Layout

- **Path:** `/src/app/demo/`
- **Standalone:** Local `layout.tsx` strips the global app shell (no sidebar, no nav)
- **Full viewport:** Dark background, no scroll — everything fits the screen

### File Structure

```
src/app/demo/
  layout.tsx                  ← strips global shell, sets dark bg
  page.tsx                    ← assembles all panels
  hooks/
    useSimulation.ts          ← single simulation engine
  components/
    TopBar.tsx                ← global stats bar
    CampaignsFeed.tsx         ← left panel, scrolling campaign cards
    RobotMap.tsx              ← center panel, Leaflet SF map
    AuctionPanel.tsx          ← right panel, bids + robot visual
    AnalyticsBar.tsx          ← bottom bar, live metrics
```

---

## Simulation Engine (`useSimulation`)

Single hook, single source of truth. All panels read from it.

### State

```ts
robots[]       // 40 robots across SF: { id, lat, lng, activeCampaign, color, engagementMode }
campaigns[]    // 8–12 active: { brand, type, budget, status, cpm, color }
auctionFeed[]  // last 20 bid events
metrics        // { impressions, engagements, revenue, avgCpm, revenuePerMinute }
activeCampaign // currently featured campaign (drives ad preview)
engagementEvent // boolean pulse for sensor trigger
```

### Simulation Loop (every 1.5s)

1. Robots nudge position (small random lat/lng delta — smooth drift)
2. 30% chance: new campaign enters auction with "Entering Auction" status
3. Auction resolves → winning brand assigned to 3–5 robots → robots change color
4. Auction event appended to feed: `"Nike bids $12 CPM → wins Robot #284"`
5. Metrics increment: impressions +12–40, revenue += (cpm/1000 × impressions)
6. Every 8–12s: `engagementEvent` fires — triggers robot animation sequence

### Mock Brands

Nike, Coca-Cola, Uber Eats, Spotify, Apple, Adidas, Starbucks, Netflix, Airbnb, Google

Each brand has a defined color, CPM range, and campaign type.

---

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR: Kovio logo | 🟢 Live | Robots | Campaigns | $ | # │
├─────────────────┬───────────────────────┬───────────────────┤
│  CAMPAIGNS FEED │                       │  AUCTION FEED     │
│                 │   ROBOT MAP (SF)      │  scrolling bids   │
│  Scrolling      │   CartoDB Dark tiles  ├───────────────────┤
│  campaign cards │   40 colored dots     │  ROBOT VISUAL     │
│  animate in     │   click → popup       │  SVG humanoid     │
│  from top       │   pulse rings         │  chest screen     │
│                 │   heat zones          │  engagement anim  │
├─────────────────┴───────────────────────┴───────────────────┤
│  ANALYTICS BAR: Impressions | Engagements | Avg CPM | Rev/m  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Designs

### TopBar

- Kovio wordmark (left)
- "Live Network Demo" badge with pulsing green dot
- 4 stat counters updating every 1–2s:
  - Total Active Robots
  - Active Campaigns
  - Impressions Today
  - Revenue Generated

### CampaignsFeed (left panel)

- Scrollable list of campaign cards (max 8 visible)
- New cards animate in from the top every 3–5s
- Each card: brand logo color swatch, brand name, campaign type, budget, status badge
- Status transitions: `Entering Auction` → `Live` → `Scaling`
- `Live` status triggers a green flash on the card

### RobotMap (center panel, primary visual)

- **Tiles:** CartoDB Dark Matter (free, no API key)
- **Center:** San Francisco (~37.77, -122.43), zoom 13
- **Robots:** 40 custom HTML markers — colored circles with a CSS pulse ring
- **Color:** Maps to active campaign brand color
- **Movement:** Smooth position nudge every 1.5s using Leaflet `setLatLng`
- **Engagement mode:** Marker pulse ring speeds up and brightens
- **Click popup:** Robot ID, current campaign, current CPM, engagement rate
- **Hover tooltip:** "Ad now playing: [Brand]"
- **Heat zones:** 3 fixed high-traffic zones (Union Square, SOMA, Mission) rendered as semi-transparent radial gradients

### AuctionPanel (right panel)

**Top section — Auction Feed:**
- Scrolling list of bid events (newest at top)
- Each event: brand name, bid amount, robot ID won
- Animate in with a slide-down effect
- Winning bids flash gold briefly

**Bottom section — Robot Visual:**
- SVG humanoid robot figure (stylized, not photorealistic)
- Glowing LED "eyes"
- Chest-mounted screen showing current ad creative
  - Brand name, gradient background in brand color, CTA button
  - Smooth crossfade on brand switch (~0.5s transition)

**Engagement Animation Sequence** (fires every 8–12s):
1. "👤 Human Detected" badge pulses onto the robot (top-left of visual)
2. Robot eyes glow brighter (CSS filter brightness increase)
3. Chest screen scales up slightly (1.0 → 1.05 transform)
4. QR code and "Scan to Engage" CTA replaces normal ad
5. Sonar ripple rings radiate outward from the robot (3 expanding circles, fade out)
6. Engagements counter ticks up in analytics bar
7. After 3s: returns to normal ad display

### AnalyticsBar (bottom panel)

- 4 stat tiles: Impressions, Engagements, Avg CPM, Revenue/min
- Numbers increment smoothly (interpolated, not jumping)
- Small sparkline graph on Revenue/min (Recharts LineChart, last 30 data points)

---

## Key Moment Flow

When a new campaign wins auction:

1. CampaignsFeed card status flips `Entering Auction` → `Live` (green flash animation)
2. 3–5 map robot dots change color simultaneously
3. AuctionPanel bid event scrolls in (gold flash)
4. Robot chest screen crossfades to new brand creative
5. Metrics spike briefly (+animation on the numbers)

This loop runs continuously and autonomously — the page feels alive from the moment it loads.

---

## Design System

- **Background:** `#0A0A0F` (near black)
- **Panels:** Glassmorphism — `bg-white/5 backdrop-blur border border-white/10`
- **Accents:** Brand colors + indigo (#4F46E5) for Kovio chrome
- **Font:** Geist (existing) — monospace for numbers
- **Animations:** CSS keyframes for pulse, ripple, fade — no heavy animation libraries
- **Map:** Dark, no labels on tiles for cleaner look

---

## Dependencies to Add

- `react-leaflet` — map rendering
- `leaflet` — underlying map library

Both are free, no API key required with CartoDB tiles.

---

## Non-Goals

- No backend, no real data
- No auth, no user accounts
- No mobile optimization (investor demo = laptop/projector)
- No integration with existing app shell or Supabase
