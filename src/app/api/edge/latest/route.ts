import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/supabase/storage";
import type { CampaignRow, CreativeRow } from "@/lib/supabase/types";

export async function GET() {
  const supabase = createServiceClient();

  // 1. Find the most recently created active, ready campaign
  const campaignResult = await supabase
    .from("campaigns")
    .select("*")
    .eq("campaign_ready", true)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const campaign = campaignResult.data as CampaignRow | null;
  if (!campaign || !campaign.creative_ids?.length) {
    return NextResponse.json({ status: "no_content" });
  }

  // 2. Fetch the most recently uploaded creative for this campaign
  const creativeResult = await supabase
    .from("creatives")
    .select("*")
    .in("id", campaign.creative_ids)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const creative = creativeResult.data as CreativeRow | null;
  if (!creative || !creative.asset_path) {
    return NextResponse.json({ status: "no_content" });
  }

  // 3. Build signed URL for the latest creative
  let mediaUrl: string;
  try {
    mediaUrl = await getSignedUrl(creative.asset_path, 3600);
  } catch {
    return NextResponse.json({ status: "no_content" });
  }

  return NextResponse.json({
    campaign_id: campaign.id,
    campaign_name: campaign.name,
    media: [
      {
        media_type: creative.media_type ?? "image",
        mime_type: creative.mime_type ?? "image/png",
        media_url: mediaUrl,
        duration_seconds: creative.duration_seconds ?? null,
      },
    ],
  });
}
