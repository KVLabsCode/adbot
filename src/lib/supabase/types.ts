import type {
  Creative,
  CreativeStatus,
  FormatContent,
  FormatType,
  RobotType,
  Campaign,
  CampaignType,
  CampaignStatus,
  CampaignSchedule,
  FlowType,
  TimeWindow,
} from "@/types";

// ---- Database interface for typed Supabase client ----

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          role?: string;
          created_at?: string;
        };
      };
      creatives: {
        Row: CreativeRow;
        Insert: CreativeInsert;
        Update: CreativeUpdate;
      };
      campaigns: {
        Row: CampaignRow;
        Insert: CampaignInsert;
        Update: CampaignUpdate;
      };
      devices: {
        Row: DeviceRow;
        Insert: DeviceInsert;
        Update: DeviceUpdate;
      };
      edge_payloads: {
        Row: EdgePayloadRow;
        Insert: EdgePayloadInsert;
        Update: EdgePayloadUpdate;
      };
      config_flags: {
        Row: ConfigFlagRow;
        Insert: ConfigFlagInsert;
        Update: ConfigFlagUpdate;
      };
      impressions: {
        Row: ImpressionRow;
        Insert: ImpressionInsert;
        Update: ImpressionUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ---- Row types ----

export interface CreativeRow {
  id: string;
  organization_id: string;
  name: string | null;
  format_type: string;
  asset_path: string;
  metadata: Record<string, unknown>;
  robot_compatibility: string[];
  status: string;
  version: number;
  media_type: string | null;
  mime_type: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreativeInsert {
  id?: string;
  organization_id: string;
  name?: string | null;
  format_type: string;
  asset_path?: string;
  metadata?: Record<string, unknown>;
  robot_compatibility?: string[];
  status?: string;
  version?: number;
  media_type?: string;
  mime_type?: string;
  duration_seconds?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreativeUpdate {
  id?: string;
  organization_id?: string;
  name?: string | null;
  format_type?: string;
  asset_path?: string;
  metadata?: Record<string, unknown>;
  robot_compatibility?: string[];
  status?: string;
  version?: number;
  media_type?: string;
  mime_type?: string;
  duration_seconds?: number;
  updated_at?: string;
}

export interface CampaignRow {
  id: string;
  organization_id: string;
  name: string;
  robot_type: string;
  subtype: string;
  flow: string;
  budget_cents: number;
  creative_ids: string[];
  guardrails: Record<string, unknown>;
  campaign_ready: boolean;
  status: string;
  deployed_version: number;
  start_date: string | null;
  end_date: string | null;
  time_windows: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignInsert {
  id?: string;
  organization_id: string;
  name: string;
  robot_type: string;
  subtype: string;
  flow: string;
  budget_cents?: number;
  creative_ids?: string[];
  guardrails?: Record<string, unknown>;
  campaign_ready?: boolean;
  status?: string;
  deployed_version?: number;
  start_date?: string | null;
  end_date?: string | null;
  time_windows?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface CampaignUpdate {
  id?: string;
  organization_id?: string;
  name?: string;
  robot_type?: string;
  subtype?: string;
  flow?: string;
  budget_cents?: number;
  creative_ids?: string[];
  guardrails?: Record<string, unknown>;
  campaign_ready?: boolean;
  status?: string;
  deployed_version?: number;
  start_date?: string | null;
  end_date?: string | null;
  time_windows?: string[] | null;
  updated_at?: string;
}

export interface DeviceRow {
  id: string;
  organization_id: string | null;
  name: string | null;
  device_secret: string;
  hardware_spec: Record<string, unknown>;
  last_seen: string | null;
  status: string;
  created_at: string;
}

export interface DeviceInsert {
  id?: string;
  organization_id?: string | null;
  name?: string | null;
  device_secret: string;
  hardware_spec?: Record<string, unknown>;
  last_seen?: string | null;
  status?: string;
  created_at?: string;
}

export interface DeviceUpdate {
  id?: string;
  organization_id?: string | null;
  name?: string | null;
  device_secret?: string;
  hardware_spec?: Record<string, unknown>;
  last_seen?: string | null;
  status?: string;
}

export interface EdgePayloadRow {
  id: string;
  organization_id: string | null;
  version: number;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface EdgePayloadInsert {
  id?: string;
  organization_id?: string | null;
  version: number;
  payload: Record<string, unknown>;
  created_at?: string;
}

export interface EdgePayloadUpdate {
  id?: string;
  organization_id?: string | null;
  version?: number;
  payload?: Record<string, unknown>;
}

export interface ConfigFlagRow {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface ConfigFlagInsert {
  key: string;
  value: Record<string, unknown>;
  updated_at?: string;
}

export interface ConfigFlagUpdate {
  key?: string;
  value?: Record<string, unknown>;
  updated_at?: string;
}

export interface ImpressionRow {
  id: string;
  campaign_id: string;
  creative_id: string;
  device_id: string;
  revenue: number;
  created_at: string;
}

export interface ImpressionInsert {
  id?: string;
  campaign_id: string;
  creative_id: string;
  device_id: string;
  revenue?: number;
  created_at?: string;
}

export interface ImpressionUpdate {
  id?: string;
  campaign_id?: string;
  creative_id?: string;
  device_id?: string;
  revenue?: number;
  created_at?: string;
}

// ---- Converters ----

const DEMO_ORG_ID = "a0000000-0000-0000-0000-000000000001";

export function creativeRowToApp(row: CreativeRow): Creative {
  return {
    id: row.id,
    name: row.name ?? "",
    formatType: row.format_type as FormatType,
    robotTypes: (row.robot_compatibility ?? []) as RobotType[],
    status: row.status as CreativeStatus,
    content: (row.metadata ?? {}) as unknown as FormatContent,
    validationResults: [],
    lastModified: row.updated_at,
    assetPath: row.asset_path || undefined,
    mediaType: row.media_type ?? undefined,
    mimeType: row.mime_type ?? undefined,
  };
}

export function creativeAppToRow(
  creative: Creative,
  orgId: string = DEMO_ORG_ID
): CreativeInsert {
  return {
    organization_id: orgId,
    name: creative.name,
    format_type: creative.formatType,
    asset_path: creative.assetPath ?? "",
    metadata: creative.content as unknown as Record<string, unknown>,
    robot_compatibility: creative.robotTypes as string[],
    status: creative.status,
    media_type: creative.mediaType,
    mime_type: creative.mimeType,
  };
}

export function campaignRowToApp(row: CampaignRow): Campaign {
  return {
    id: row.id,
    name: row.name,
    type: row.subtype as CampaignType,
    status: row.status as CampaignStatus,
    flow: row.flow as FlowType,
    formats: [],
    budget: row.budget_cents / 100,
    metrics: { asp: 0, dcv: 0, cpd: 0, rdr: 0 },
    createdAt: row.created_at,
    creativeIds: row.creative_ids ?? [],
    schedule:
      row.start_date && row.end_date
        ? {
            startDate: row.start_date,
            endDate: row.end_date,
            timeWindows: (row.time_windows as TimeWindow[] | null) ?? undefined,
          }
        : undefined,
  };
}

export function campaignAppToRow(
  campaign: Campaign,
  orgId: string = DEMO_ORG_ID,
  robotType: string = "retail"
): CampaignInsert {
  return {
    organization_id: orgId,
    name: campaign.name,
    robot_type: robotType,
    subtype: campaign.type,
    flow: campaign.flow,
    budget_cents: Math.round(campaign.budget * 100),
    creative_ids: campaign.creativeIds ?? [],
    status: campaign.status,
    campaign_ready: campaign.status === "active",
    start_date: campaign.schedule?.startDate ?? null,
    end_date: campaign.schedule?.endDate ?? null,
    time_windows: campaign.schedule?.timeWindows ?? null,
  };
}
