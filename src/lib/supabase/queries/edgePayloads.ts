import { createServiceClient } from "../server";
import type { EdgePayloadRow } from "../types";

export async function createPayloadSnapshot(
  orgId: string,
  payload: Record<string, unknown>
): Promise<EdgePayloadRow> {
  const supabase = createServiceClient();

  // Get latest version for this org
  const latestResult = await supabase
    .from("edge_payloads")
    .select("version")
    .eq("organization_id", orgId)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const latestVersion = (latestResult.data as { version: number } | null)?.version ?? 0;
  const nextVersion = latestVersion + 1;

  const result = await supabase
    .from("edge_payloads")
    .insert({
      organization_id: orgId,
      version: nextVersion,
      payload,
    } as never)
    .select()
    .single();

  if (result.error) {
    console.error("Failed to create payload snapshot:", result.error);
    throw result.error;
  }
  return result.data as EdgePayloadRow;
}

export async function getLatestPayload(
  orgId: string
): Promise<EdgePayloadRow | null> {
  const supabase = createServiceClient();
  const result = await supabase
    .from("edge_payloads")
    .select("*")
    .eq("organization_id", orgId)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (result.error && result.error.code !== "PGRST116") {
    console.error("Failed to get latest payload:", result.error);
    throw result.error;
  }
  return (result.data as EdgePayloadRow | null) ?? null;
}
