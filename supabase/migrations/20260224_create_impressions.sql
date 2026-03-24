-- Impression tracking table
-- Records every ad display confirmed by an AdPod device

create table if not exists impressions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  creative_id uuid references creatives(id) on delete cascade,
  device_id text not null,
  revenue numeric(10,2) default 0,
  created_at timestamp with time zone default now()
);

create index if not exists impressions_campaign_idx on impressions(campaign_id);
create index if not exists impressions_created_at_idx on impressions(created_at);
create index if not exists impressions_device_idx on impressions(device_id);
