import { createServiceClient } from "../server";
import type { ConfigFlagRow } from "../types";

export async function getDemoMode(): Promise<boolean> {
  const supabase = createServiceClient();
  const result = await supabase
    .from("config_flags")
    .select("*")
    .eq("key", "demo_mode")
    .single();

  const data = result.data as ConfigFlagRow | null;
  if (!data) return true; // default to demo mode on error
  return (data.value as { enabled: boolean }).enabled;
}

export async function setDemoMode(enabled: boolean): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("config_flags")
    .upsert({ key: "demo_mode", value: { enabled } } as never);

  if (error) {
    console.error("Failed to set demo mode:", error);
    throw error;
  }
}
