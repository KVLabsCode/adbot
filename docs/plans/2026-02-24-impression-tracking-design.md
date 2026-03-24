# Impression Tracking Design

**Linear Issue:** FE-84
**Date:** 2026-02-24

## Overview

Production-grade impression tracking for the Kovio adbot platform. Every time an ad is displayed on an AdPod device, an impression is recorded in the database and reflected in the reporting dashboard.

## 1. Database: `impressions` table

```sql
create table impressions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  creative_id uuid references creatives(id) on delete cascade,
  device_id text not null,
  revenue numeric(10,2) default 0,
  created_at timestamp with time zone default now()
);

create index impressions_campaign_idx on impressions(campaign_id);
create index impressions_created_at_idx on impressions(created_at);
create index impressions_device_idx on impressions(device_id);
```

## 2. New Endpoint: `POST /api/track/impression`

- Accepts `{ campaign_id, creative_id, device_id }`
- Validates campaign exists and is active
- Computes revenue: `budget_cents / 1000` (stored as dollars)
- Inserts row into `impressions` table
- Returns `{ success: true }`

## 3. Additive Change to `/api/edge/live` Response

Each playlist item gains two fields (no existing fields removed or changed):

```json
{
  "campaign_id": "...",
  "campaign_name": "...",
  "creative_id": "...",
  "media_type": "video",
  "media_url": "...",
  "impression_url": "/api/track/impression",
  "duration_seconds": 10
}
```

## 4. Revenue Formula

```
revenue_per_impression = campaign.budget_cents / 1000
```

- Stored as dollars in the `revenue` numeric(10,2) column
- A campaign with budget_cents = 5000 ($50) yields $5.00 per impression
- Computed at insert time in the tracking endpoint

## 5. Reporting: New Impression Metrics Section

- New `GET /api/reporting/impressions` endpoint aggregating from `impressions` table
- Returns: total impressions, impressions today, per-campaign breakdown, unique devices, total revenue, eCPM
- New section added below existing KPI cards on reporting page
- Cards: Impressions, Revenue, eCPM, Devices Active
- Existing fixture-driven KPIs (ASP/DCV/CPD/RDR) remain untouched

### eCPM Calculation

```
eCPM = (total_revenue / total_impressions) * 1000
```

## 6. Anti-Duplicate Protection

Deferred to a future iteration. Device script controls firing — one impression per display event.

## 7. Constraints

- Must work in Live mode only
- No fake increments or demo logic
- Impression must be server-recorded
- Only track when device confirms display
- Existing `/api/edge/live` response shape is additive only — no breaking changes
