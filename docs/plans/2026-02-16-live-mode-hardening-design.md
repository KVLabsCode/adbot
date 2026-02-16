# FE-80: Live Mode Hardening + Direct Edge Delivery

## Goal

Convert Live mode into a fully database-driven production system where campaigns cannot launch without a persisted creative (image or video), and launching a campaign makes that media immediately available via a simple API endpoint that a Raspberry Pi can poll and display.

**Pipeline:** Upload creative → Launch campaign → Pi calls `/api/edge/live` → gets signed media URL → displays it.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Approach | Fix existing FE-79 plumbing gaps | 90% of infrastructure exists, just needs wiring |
| Edge endpoint | New `/api/edge/live` (no auth) | Pi needs simplest possible GET → media URL |
| Upload location | Shared step in CreateNewFlow | All format types need upload in live mode, not just display cards |
| Creative selection | Picker step in launch flow | User explicitly binds creatives to campaigns |
| Existing [deviceId] route | Keep untouched | Works, doesn't interfere |

## Database Changes

Single migration — add 3 columns to `creatives`:

```sql
alter table creatives
  add column media_type text default 'image',
  add column mime_type text,
  add column duration_seconds int;
```

Allowed MIME types: `image/png`, `image/jpeg`, `image/webp`, `video/mp4`, `video/webm`.

## App Type Changes

### Creative (add 3 optional fields)

```typescript
export interface Creative {
  // ... existing fields ...
  assetPath?: string;
  mediaType?: string;
  mimeType?: string;
}
```

### Campaign (add creativeIds)

```typescript
export interface Campaign {
  // ... existing fields ...
  creativeIds?: string[];
}
```

### CampaignDraft (add creativeIds)

```typescript
export interface CampaignDraft {
  // ... existing fields ...
  creativeIds?: string[];
}
```

## Fix: Creative Upload Pipeline

**Problem:** DisplayCardBuilder uploads files to storage but never saves `asset_path` back to the creative DB row. `creativeAppToRow()` hardcodes `asset_path: ""`.

**Fix:**

1. Move file upload from DisplayCardBuilder into CreateNewFlow as a shared step that appears for all format types in live mode
2. New flow in live mode: format-select → robot-select → **upload-media** → builder → save
3. Upload step: user picks image/video file, uploaded to `creative-assets` bucket, path stored in component state
4. On save: `asset_path`, `media_type`, `mime_type` passed into the Creative object
5. `creativeAppToRow()` updated to pass through `asset_path` from creative instead of hardcoding `""`
6. DisplayCardBuilder mock upload zone removed (upload now handled in CreateNewFlow)

**Validation:** In live mode, "Save & Validate" only enables if a file has been uploaded.

## Fix: Campaign ↔ Creative Binding

**Problem:** App `Campaign` has no `creative_ids`. `launchDraft()` never populates them. Edge API gets empty arrays.

**Fix:**

1. Add `creativeIds` to Campaign and CampaignDraft types
2. New step in LaunchFlow between config and review: **creative picker**
   - Shows all creatives from store with status VALIDATED or LIVE
   - User selects one or more
   - In demo mode: step is skipped (uses fixture formats as today)
3. `launchDraft()` passes `creative_ids` through `campaignAppToRow()`
4. CampaignReview: in live mode, disable Launch button if no creativeIds selected, show warning message

## New: `/api/edge/live` Endpoint

`GET /api/edge/live` — no auth, no HMAC. Simplest possible endpoint.

### Behavior

1. Service client → find first campaign where `campaign_ready = true` AND `status = 'active'`
2. Get first creative ID from `creative_ids`
3. Fetch creative row
4. Generate 1hr signed URL for `asset_path`
5. Return JSON:

```json
{
  "campaign_id": "uuid",
  "campaign_name": "Retail — Decision Bid",
  "media_type": "video",
  "mime_type": "video/mp4",
  "media_url": "https://qmwvwpdtvdpbhqswvvrw.supabase.co/storage/v1/...",
  "duration_seconds": 15
}
```

If no active campaign or no creative: return `{"status": "no_content"}` with 200.

### Raspberry Pi Usage

```python
import requests, time, subprocess

API_URL = "https://yourdomain.com/api/edge/live"

while True:
    try:
        res = requests.get(API_URL, timeout=5)
        data = res.json()
        if data.get("status") == "no_content":
            time.sleep(30)
            continue
        media_url = data["media_url"]
        media_type = data["media_type"]
        r = requests.get(media_url)
        with open("/tmp/current_media", "wb") as f:
            f.write(r.content)
        if media_type == "video":
            subprocess.run(["mpv", "--fs", "/tmp/current_media"])
        else:
            subprocess.run(["feh", "--fullscreen", "/tmp/current_media"])
    except Exception as e:
        print("Error:", e)
    time.sleep(30)
```

## Demo vs Live Behavior

| Behavior | Demo Mode | Live Mode |
|---|---|---|
| Creative creation | No upload required | File upload mandatory |
| Campaign launch | Uses fixture formats, no creative binding | Requires DB creative with uploaded asset |
| `/api/edge/live` | Returns `no_content` | Returns signed media URL |
| Store hydration | JSON fixtures | Supabase DB |
| Launch button | Always enabled | Disabled without creative selection |

## Files Summary

### New files (1)

| File | Purpose |
|---|---|
| `src/app/api/edge/live/route.ts` | Simple edge delivery endpoint for Pi |

### Modified files (8)

| File | Changes |
|---|---|
| `src/types/index.ts` | Add `assetPath`, `mediaType`, `mimeType` to Creative; `creativeIds` to Campaign + CampaignDraft |
| `src/lib/supabase/types.ts` | Add `media_type`, `mime_type`, `duration_seconds` to CreativeRow/Insert/Update; fix converters |
| `src/store/index.ts` | Pass `creativeIds` through `launchDraft()`, include in `campaignAppToRow()` |
| `src/components/creative/CreateNewFlow.tsx` | Add upload-media step (live mode only), pass asset fields to creative |
| `src/components/creative/builders/DisplayCardBuilder.tsx` | Remove upload UI (moved to CreateNewFlow) |
| `src/components/studio/LaunchFlow.tsx` | Add creative picker step between config and review |
| `src/components/studio/CampaignReview.tsx` | Disable launch in live mode when no creatives selected |
| `src/lib/actionRegistry.ts` | Pass creativeIds from draft through to launchDraft |

### DB migration (1)

Add `media_type`, `mime_type`, `duration_seconds` columns to creatives table.

## Acceptance Criteria

1. Creative upload stores file in Supabase Storage with correct asset_path in DB
2. Image (png/jpeg/webp) and video (mp4/webm) both work
3. Campaign cannot launch without creative in live mode
4. Launch writes campaign with creative_ids to DB
5. `GET /api/edge/live` returns active campaign with signed media URL
6. Python script can fetch and display media on Raspberry Pi
7. Demo mode works exactly as before (no upload required, fixtures used)
8. `npm run build` passes with zero errors
