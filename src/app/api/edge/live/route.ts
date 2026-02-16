import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/supabase/storage";
import type { CampaignRow, CreativeRow } from "@/lib/supabase/types";

export async function GET() {
  const supabase = createServiceClient();

  // 1. Find first active, ready campaign
  const campaignResult = await supabase
    .from("campaigns")
    .select("*")
    .eq("campaign_ready", true)
    .eq("status", "active")
    .limit(1)
    .single();

  const campaign = campaignResult.data as CampaignRow | null;
  if (!campaign) {
    return NextResponse.json({ status: "no_content" });
  }

  // 2. Get first creative ID
  const creativeIds = campaign.creative_ids ?? [];
  if (creativeIds.length === 0) {
    return NextResponse.json({ status: "no_content" });
  }

  // 3. Fetch creative
  const creativeResult = await supabase
    .from("creatives")
    .select("*")
    .eq("id", creativeIds[0])
    .single();

  const creative = creativeResult.data as CreativeRow | null;
  if (!creative || !creative.asset_path) {
    return NextResponse.json({ status: "no_content" });
  }

  // 4. Generate signed URL (1 hour)
  let mediaUrl: string;
  try {
    mediaUrl = await getSignedUrl(creative.asset_path, 3600);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }

  // 5. Return payload
  return NextResponse.json({
    campaign_id: campaign.id,
    campaign_name: campaign.name,
    media_type: creative.media_type ?? "image",
    mime_type: creative.mime_type ?? "image/png",
    media_url: mediaUrl,
    duration_seconds: creative.duration_seconds ?? null,
  });
}
