import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import bcrypt from "bcryptjs";
import { createServiceClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/supabase/storage";
import type { DeviceRow, CampaignRow, CreativeRow } from "@/lib/supabase/types";
import { updateDeviceLastSeen } from "@/lib/supabase/queries/devices";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params;
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
  }

  const bearerToken = authHeader.slice(7);
  const supabase = createServiceClient();

  // 1. Fetch device
  const deviceResult = await supabase
    .from("devices")
    .select("*")
    .eq("id", deviceId)
    .single();

  const device = deviceResult.data as DeviceRow | null;
  if (!device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  // 2. Verify secret
  const secretValid = await bcrypt.compare(bearerToken, device.device_secret);
  if (!secretValid) {
    return NextResponse.json({ error: "Invalid device secret" }, { status: 403 });
  }

  // 3. Fetch ready campaigns for device's org
  const campaignsResult = await supabase
    .from("campaigns")
    .select("*")
    .eq("organization_id", device.organization_id!)
    .eq("campaign_ready", true);

  const campaigns = (campaignsResult.data ?? []) as CampaignRow[];

  // 4. Fetch creatives referenced by campaigns
  const creativeIds = campaigns.flatMap((c) => c.creative_ids ?? []);
  const uniqueCreativeIds = [...new Set(creativeIds)];

  let creatives: CreativeRow[] = [];
  if (uniqueCreativeIds.length > 0) {
    const creativesResult = await supabase
      .from("creatives")
      .select("*")
      .in("id", uniqueCreativeIds);
    creatives = (creativesResult.data ?? []) as CreativeRow[];
  }

  // 5. Generate signed URLs for assets
  const creativesWithUrls = await Promise.all(
    creatives.map(async (c) => {
      let signedUrl = "";
      if (c.asset_path) {
        try {
          signedUrl = await getSignedUrl(c.asset_path, 3600);
        } catch {
          // skip — asset may not exist
        }
      }
      return { ...c, signed_url: signedUrl };
    })
  );

  // 6. Build payload
  const payload = {
    version: Date.now(),
    device_id: deviceId,
    campaigns: campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      robot_type: c.robot_type,
      subtype: c.subtype,
      flow: c.flow,
      guardrails: c.guardrails,
      creative_ids: c.creative_ids,
    })),
    creatives: creativesWithUrls.map((c) => ({
      id: c.id,
      format_type: c.format_type,
      metadata: c.metadata,
      signed_url: c.signed_url,
    })),
  };

  // 7. HMAC-SHA256 sign
  const hmacSecret = process.env.EDGE_PAYLOAD_HMAC_SECRET;
  let signature = "";
  if (hmacSecret) {
    signature = createHmac("sha256", hmacSecret)
      .update(JSON.stringify(payload))
      .digest("hex");
  }

  // 8. Update last_seen (fire-and-forget)
  updateDeviceLastSeen(deviceId);

  // 9. Return
  return NextResponse.json(payload, {
    headers: {
      "X-Signature": signature,
      "Cache-Control": "no-store",
    },
  });
}
