import { createServiceClient } from "../server";
import type { CampaignInsert, CampaignUpdate, CampaignRow } from "../types";

const DEMO_ORG_ID = "a0000000-0000-0000-0000-000000000001";

export async function listCampaigns(
  orgId: string = DEMO_ORG_ID
): Promise<CampaignRow[]> {
  const supabase = createServiceClient();
  const result = await supabase
    .from("campaigns")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (result.error) {
    console.error("Failed to list campaigns:", result.error);
    throw result.error;
  }
  return (result.data ?? []) as CampaignRow[];
}

export async function insertCampaign(
  row: CampaignInsert
): Promise<CampaignRow> {
  const supabase = createServiceClient();
  const result = await supabase
    .from("campaigns")
    .insert(row as never)
    .select()
    .single();

  if (result.error) {
    console.error("Failed to insert campaign:", result.error);
    throw result.error;
  }
  return result.data as CampaignRow;
}

export async function updateCampaignDb(
  id: string,
  updates: CampaignUpdate
): Promise<CampaignRow> {
  const supabase = createServiceClient();
  const result = await supabase
    .from("campaigns")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (result.error) {
    console.error("Failed to update campaign:", result.error);
    throw result.error;
  }
  return result.data as CampaignRow;
}
