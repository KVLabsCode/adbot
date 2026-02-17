# Campaign & Creative Naming + Small Media Preview Design

**Issue:** FE-81
**Date:** 2026-02-17
**Approach:** Bottom-up (DB → API → Components → Pages)

---

## Decisions

- Campaign and creative names are **strictly required** (no fallbacks)
- **Unique names** enforced per organization in the database
- **Click-to-edit inline** rename (no modal, no icon trigger)
- **Server-side signed URLs** returned from API routes (no client-side fetching)
- Demo mode: placeholder thumbnails, store-only rename

---

## Part 1 — Database Migration

Migration: `enforce_names_and_unique_indexes`

```sql
ALTER TABLE campaigns ALTER COLUMN name SET NOT NULL;
ALTER TABLE creatives ALTER COLUMN name SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS campaigns_name_per_org
  ON campaigns (organization_id, name);

CREATE UNIQUE INDEX IF NOT EXISTS creatives_name_per_org
  ON creatives (organization_id, name);
```

Update `CreativeRow.name` type from `string | null` to `string`.

---

## Part 2 — API Route Updates

### GET /api/creatives
- For each creative with `asset_path`, generate signed URL via `getSignedUrl(asset_path, 3600)`
- Return `media_url` field alongside existing data
- If signed URL fails, return `null` for that creative's URL

### GET /api/campaigns
- For each campaign, fetch the first creative's `asset_path`
- Generate signed URL for the preview thumbnail
- Return `preview_url` field on each campaign
- If signed URL fails, return `null`

---

## Part 3 — Shared Components

### SmallCreativePreview

File: `src/components/creative/SmallCreativePreview.tsx`

```typescript
type Props = {
  mediaType: 'image' | 'video'
  url: string
}
```

- Image: `<img>` tag, `w-24 h-16 object-cover rounded-md`
- Video: `<video>` tag, same dimensions, `muted autoPlay loop playsInline`
- Fallback: gray placeholder with media icon when `url` is falsy

### InlineEditableName

File: `src/components/ui/InlineEditableName.tsx`

```typescript
type Props = {
  value: string
  onSave: (newName: string) => Promise<void>
  className?: string
}
```

- Default: renders name as text
- Click: switches to `<input>`, auto-focused
- Enter: calls `onSave`, optimistic update
- Escape: cancels, reverts
- Validation: cannot save empty string
- Loading: subtle opacity change while saving

---

## Part 4 — Page Integration

### Campaigns Table (CampaignsTable.tsx)
- Add **Preview** column as first column
- Render `SmallCreativePreview` using `preview_url` from API
- Replace name text with `InlineEditableName` (calls PATCH /api/campaigns/[id])
- Table: `| Preview | Name (editable) | Type | Status | Budget |`

### Creatives Grid (MyCreatives.tsx)
- Add `SmallCreativePreview` at top of each card (using `media_url` from API)
- Replace name text with `InlineEditableName` (calls PATCH /api/creatives/[id])
- Card: `[Thumbnail] → Name (editable) → Image/Video badge + Status`

### Name Validation in Flows

**LaunchFlow.tsx:**
- Remove fallback: use `campaignName.trim()` only
- Disable Launch button if name is empty
- Inline error text under input

**CreateNewFlow.tsx:**
- Same: remove fallback, disable save if empty, inline error

---

## Part 5 — Demo Mode

- Live mode: all reads/writes via Supabase API, real signed URLs, API-backed rename
- Demo mode: Zustand store only, placeholder thumbnails, store-only rename
- Uses existing store write-through pattern (`!demoMode` check)

---

## Acceptance Criteria

- Campaign must have name before launch
- Creative must have name before upload
- Names persist in Supabase
- Campaign page shows small media preview
- Creative page shows small media preview
- Video previews auto-play silently
- Rename updates instantly via click-to-edit
- No fixture usage in live mode
- All reads/writes use Supabase in live mode
