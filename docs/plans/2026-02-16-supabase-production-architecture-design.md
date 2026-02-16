# FE-79: Supabase-Native Production Architecture

## Goal

Move from demo mode to a Supabase-native production system where:

1. Advertiser uploads creative → stored in Supabase Storage
2. Creative metadata saved in Postgres
3. Campaign created → marked `campaign_ready = true`
4. Raspberry Pi devices fetch signed payload via secure API
5. Demo mode toggle exists in DB

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | Dual-mode Zustand (write-through to Supabase) | Minimal disruption to 50+ existing components; demo toggle trivial |
| Edge API | Next.js API route at `/api/edge/payload/[deviceId]` | Same codebase, simpler deployment |
| Auth scope | Schema + client only (no login UI) | Seed org/user for dev; auth UI in future ticket |
| ORM | None — raw `@supabase/supabase-js` | Keeps it simple, no extra abstraction layer |
| Device auth | bcryptjs hashed secrets, service role key | Devices never use anon key |

## Database Schema

### organizations

```sql
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);
```

### profiles (links to Supabase Auth)

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id),
  role text default 'admin',
  created_at timestamptz default now()
);
```

### creatives

```sql
create table creatives (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text,
  format_type text not null,
  asset_path text not null,
  metadata jsonb default '{}'::jsonb,
  robot_compatibility jsonb default '[]'::jsonb,
  status text default 'draft',
  version int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Maps from existing `Creative` interface:
- `content: FormatContent` → `metadata` jsonb
- `robotTypes: RobotType[]` → `robot_compatibility` jsonb
- `asset_path` points to Supabase Storage bucket path (not full URL)

### campaigns

```sql
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  robot_type text not null,
  subtype text not null,
  flow text not null,
  budget_cents bigint default 0,
  creative_ids uuid[] default '{}',
  guardrails jsonb default '{}'::jsonb,
  campaign_ready boolean default false,
  status text default 'draft',
  deployed_version int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Maps from existing `Campaign` interface:
- `budget: number` → `budget_cents: bigint` (cents, not dollars)
- Adds `robot_type`, `subtype`, `campaign_ready`, `deployed_version`, `guardrails`
- `formats: FormatContent[]` replaced by `creative_ids uuid[]` referencing creatives table

### devices (Raspberry Pi AdPods)

```sql
create table devices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  name text,
  device_secret text not null,
  hardware_spec jsonb default '{}'::jsonb,
  last_seen timestamptz,
  status text default 'active',
  created_at timestamptz default now()
);
```

### edge_payloads

```sql
create table edge_payloads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  version int not null,
  payload jsonb not null,
  created_at timestamptz default now()
);
```

### config_flags

```sql
create table config_flags (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Seed demo mode
insert into config_flags (key, value)
values ('demo_mode', '{"enabled": true}')
on conflict (key) do nothing;
```

### Auto-update trigger for updated_at

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on creatives
  for each row execute function update_updated_at();
create trigger set_updated_at before update on campaigns
  for each row execute function update_updated_at();
create trigger set_updated_at before update on config_flags
  for each row execute function update_updated_at();
```

## Row Level Security

```sql
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table creatives enable row level security;
alter table campaigns enable row level security;
alter table devices enable row level security;
```

### Policies

**Profiles** — users can read their own profile:
```sql
create policy "users read own profile"
  on profiles for select
  using (id = auth.uid());
```

**Creatives** — org members can CRUD:
```sql
create policy "org members read creatives"
  on creatives for select
  using (organization_id in (select organization_id from profiles where id = auth.uid()));

create policy "org members insert creatives"
  on creatives for insert
  with check (organization_id in (select organization_id from profiles where id = auth.uid()));

create policy "org members update creatives"
  on creatives for update
  using (organization_id in (select organization_id from profiles where id = auth.uid()));

create policy "org members delete creatives"
  on creatives for delete
  using (organization_id in (select organization_id from profiles where id = auth.uid()));
```

**Campaigns** — same org-scoped pattern as creatives.

**Devices** — no anon access. Service role key only (used by edge API).

**edge_payloads / config_flags** — RLS not enabled (service-key access only).

## File Structure (New Files)

```
src/
  lib/
    supabase/
      client.ts            # Browser Supabase client (anon key)
      server.ts            # Server Supabase client (service role key)
      types.ts             # DB row types matching schema
      queries/
        creatives.ts       # CRUD: insert, update, delete, list by org
        campaigns.ts       # CRUD: insert, update, launch (set campaign_ready)
        devices.ts         # Verify device secret, update last_seen
        config.ts          # Read/write config_flags (demo_mode)
        edgePayloads.ts    # Insert snapshot, fetch latest by org
      storage.ts           # Upload creative to Storage, get signed URL
      hooks.ts             # React hooks: useCreatives(), useCampaigns(), useDemoMode()
  app/
    api/
      edge/
        payload/
          [deviceId]/
            route.ts       # GET: auth device → fetch campaigns → build payload → sign → return
```

## Zustand Write-Through Pattern

Zustand remains the UI state layer. Actions gain a Supabase persistence layer:

```
addCreative(creative):
  1. set() — update Zustand immediately (optimistic)
  2. supabase.from('creatives').insert(toRow(creative))
  3. On error: rollback Zustand, show error toast

launchDraft():
  1. set() — update Zustand immediately
  2. supabase.from('campaigns').update({ campaign_ready: true, status: 'ready', deployed_version: prev + 1 })
  3. supabase.from('edge_payloads').insert(buildPayloadSnapshot())
  4. On error: rollback

deleteCreative(id):
  1. set() — remove from Zustand
  2. supabase.from('creatives').delete().eq('id', id)
  3. supabase.storage.from('creatives').remove([assetPath])
```

When `demo_mode.enabled = true`: Supabase calls are skipped entirely, fixtures used as today.

## Creative Upload Flow

```
1. User selects file in Creative Studio
2. supabase.storage.from('creatives').upload(`org/${orgId}/${file.name}`, file)
3. supabase.from('creatives').insert({
     organization_id: orgId,
     name: creativeName,
     format_type: formatType,
     asset_path: `org/${orgId}/${file.name}`,
     metadata: formatContent,
     robot_compatibility: robotTypes
   })
4. Zustand state updated with new creative
```

Storage bucket is private. Signed URLs generated on demand (1hr expiry).

## Edge Payload API

`GET /api/edge/payload/[deviceId]`

```
1. Read Authorization: Bearer <device_secret> header
2. Use service role client to fetch device by ID
3. bcrypt.compare(secret, device.device_secret)
4. On fail: 401
5. Fetch campaigns where campaign_ready = true AND organization_id = device.organization_id
6. Fetch creatives referenced by campaign creative_ids
7. Generate signed URLs for each creative asset_path
8. Build payload: { version, campaigns: [...], guardrails: {...} }
9. HMAC-SHA256 sign the payload
10. Return JSON with signature header
11. Update device.last_seen = now()
```

## Demo Mode Toggle

`config_flags` table with key `demo_mode`, value `{"enabled": true}`.

When enabled:
- Campaign validation bypassed
- Seed fixtures allowed
- Edge endpoint returns demo payload
- No real bidding logic
- UI banner shows "DEMO MODE"

When disabled:
- Strict creative validation
- Only validated creatives in campaigns
- Full production logic

## Dependencies

```
@supabase/supabase-js    # Supabase client
@supabase/ssr            # Next.js SSR cookie-based auth helpers
bcryptjs                 # Device secret hashing (pure JS)
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://qmwvwpdtvdpbhqswvvrw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
EDGE_PAYLOAD_HMAC_SECRET=<random 64-char hex>
```
