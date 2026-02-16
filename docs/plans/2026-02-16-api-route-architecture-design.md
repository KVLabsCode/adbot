# API Route Architecture for DB Operations

## Problem

The Zustand store runs client-side but calls Supabase query functions that use `createServiceClient()` (service role key). The service role key is a server-only env var (`SUPABASE_SERVICE_ROLE_KEY`, not `NEXT_PUBLIC_`), so all DB writes fail silently in the browser.

Similarly, the hydration hook uses the browser client (anon key) to read from tables with RLS policies requiring `auth.uid()`. With no authenticated user, reads return empty arrays, wiping the store.

## Solution

Route all DB operations through Next.js API routes. The service role key stays server-side, and the store calls `fetch()` to these endpoints.

## API Routes

| Route | Methods | Purpose |
|---|---|---|
| `/api/creatives` | GET, POST | List creatives, create creative |
| `/api/creatives/[id]` | PATCH, DELETE | Update creative, delete creative + asset |
| `/api/campaigns` | GET, POST | List campaigns, create campaign |
| `/api/campaigns/[id]` | PATCH, DELETE | Update campaign (pause/resume/budget) |

All routes use `createServiceClient()` which bypasses RLS.

## Store Changes

Replace direct imports of server query functions with `fetch()` calls:
- `insertCreative(row)` becomes `fetch("/api/creatives", { method: "POST", body: JSON.stringify(row) })`
- `updateCreativeDb(id, updates)` becomes `fetch(`/api/creatives/${id}`, { method: "PATCH", ... })`
- Same pattern for campaigns

Keep optimistic update + rollback pattern.

## Hydration Changes

`useSupabaseHydration` switches from `createSupabaseBrowserClient().from("creatives").select("*")` to `fetch("/api/creatives")`. Server-side reads bypass RLS.

## Files Modified

- `src/app/api/creatives/route.ts` (new)
- `src/app/api/creatives/[id]/route.ts` (new)
- `src/app/api/campaigns/route.ts` (new)
- `src/app/api/campaigns/[id]/route.ts` (new)
- `src/store/index.ts` (replace server imports with fetch)
- `src/lib/supabase/hooks.ts` (replace browser client reads with fetch)
