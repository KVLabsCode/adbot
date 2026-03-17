import { createServiceClient } from "../server";
import type { ImpressionRow, CampaignRow } from "../types";

export interface ImpressionInsert {
  campaign_id: string;
  creative_id: string;
  device_id: string;
  revenue: number;
}

export interface ImpressionMetrics {
  totalImpressions: number;
  impressionsToday: number;
  totalRevenue: number;
  ecpm: number;
  uniqueDevices: number;
  perCampaign: {
    campaign_id: string;
    campaign_name: string;
    impressions: number;
    revenue: number;
  }[];
}

export async function insertImpression(
  row: ImpressionInsert
): Promise<void> {
  const supabase = createServiceClient();
  const result = await supabase
    .from("impressions")
    .insert(row as never);

  if (result.error) {
    console.error("Failed to insert impression:", result.error);
    throw result.error;
  }
}

export async function getImpressionMetrics(): Promise<ImpressionMetrics> {
  const supabase = createServiceClient();

  // Fetch all impressions
  const { data: impressions, error } = await supabase
    .from("impressions")
    .select("id, campaign_id, device_id, revenue, created_at");

  if (error) {
    console.error("Failed to fetch impressions:", error);
    throw error;
  }

  const rows = (impressions ?? []) as Pick<
    ImpressionRow,
    "id" | "campaign_id" | "device_id" | "revenue" | "created_at"
  >[];

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();

  const totalImpressions = rows.length;
  const impressionsToday = rows.filter(
    (r) => r.created_at >= todayStart
  ).length;
  const totalRevenue = rows.reduce(
    (sum, r) => sum + (Number(r.revenue) || 0),
    0
  );
  const ecpm =
    totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0;
  const uniqueDevices = new Set(rows.map((r) => r.device_id)).size;

  // Per-campaign aggregation
  const campaignMap = new Map<
    string,
    { impressions: number; revenue: number }
  >();
  for (const row of rows) {
    const existing = campaignMap.get(row.campaign_id) ?? {
      impressions: 0,
      revenue: 0,
    };
    existing.impressions += 1;
    existing.revenue += Number(row.revenue) || 0;
    campaignMap.set(row.campaign_id, existing);
  }

  // Fetch campaign names for the aggregated campaigns
  const campaignIds = [...campaignMap.keys()];
  let campaignNames = new Map<string, string>();
  if (campaignIds.length > 0) {
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, name")
      .in("id", campaignIds);

    const campaignRows = (campaigns ?? []) as Pick<CampaignRow, "id" | "name">[];
    campaignNames = new Map(campaignRows.map((c) => [c.id, c.name]));
  }

  const perCampaign = [...campaignMap.entries()].map(([id, data]) => ({
    campaign_id: id,
    campaign_name: campaignNames.get(id) ?? "Unknown",
    impressions: data.impressions,
    revenue: data.revenue,
  }));

  return {
    totalImpressions,
    impressionsToday,
    totalRevenue,
    ecpm,
    uniqueDevices,
    perCampaign,
  };
}
