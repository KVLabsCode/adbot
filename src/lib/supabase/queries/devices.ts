import { createServiceClient } from "../server";
import type { DeviceRow } from "../types";

export async function getDeviceById(
  deviceId: string
): Promise<DeviceRow | null> {
  const supabase = createServiceClient();
  const result = await supabase
    .from("devices")
    .select("*")
    .eq("id", deviceId)
    .single();

  if (result.error && result.error.code !== "PGRST116") {
    console.error("Failed to get device:", result.error);
    throw result.error;
  }
  return (result.data as DeviceRow | null) ?? null;
}

export async function updateDeviceLastSeen(deviceId: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("devices")
    .update({ last_seen: new Date().toISOString() } as never)
    .eq("id", deviceId);

  if (error) {
    console.error("Failed to update device last_seen:", error);
  }
}
