import { createServiceClient } from "../server";
import type { CreativeInsert, CreativeUpdate, CreativeRow } from "../types";

const DEMO_ORG_ID = "a0000000-0000-0000-0000-000000000001";

export async function listCreatives(
  orgId: string = DEMO_ORG_ID
): Promise<CreativeRow[]> {
  const supabase = createServiceClient();
  const result = await supabase
    .from("creatives")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (result.error) {
    console.error("Failed to list creatives:", result.error);
    throw result.error;
  }
  return (result.data ?? []) as CreativeRow[];
}

export async function insertCreative(
  row: CreativeInsert
): Promise<CreativeRow> {
  const supabase = createServiceClient();
  const result = await supabase
    .from("creatives")
    .insert(row as never)
    .select()
    .single();

  if (result.error) {
    console.error("Failed to insert creative:", result.error);
    throw result.error;
  }
  return result.data as CreativeRow;
}

export async function updateCreativeDb(
  id: string,
  updates: CreativeUpdate
): Promise<CreativeRow> {
  const supabase = createServiceClient();
  const result = await supabase
    .from("creatives")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (result.error) {
    console.error("Failed to update creative:", result.error);
    throw result.error;
  }
  return result.data as CreativeRow;
}

export async function deleteCreativeDb(id: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("creatives").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete creative:", error);
    throw error;
  }
}
