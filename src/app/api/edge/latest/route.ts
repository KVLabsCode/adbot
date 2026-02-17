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

  // 2. Fetch creatives for this campaign
  const creativeResult = await supabase
    .from("creatives")
    .select("*")
    .in("id", campaign.creative_ids);

  const creatives = (creativeResult.data ?? []) as CreativeRow[];

  // 3. Build media list with signed URLs
  const media = [];
  for (const creativeId of campaign.creative_ids) {
    const creative = creatives.find((c) => c.id === creativeId);
    if (!creative || !creative.asset_path) continue;

    try {
      const mediaUrl = await getSignedUrl(creative.asset_path, 3600);
      media.push({
        media_type: creative.media_type ?? "image",
        mime_type: creative.mime_type ?? "image/png",
        media_url: mediaUrl,
        duration_seconds: creative.duration_seconds ?? null,
      });
    } catch {
      // Skip creatives with failed signed URLs
    }
  }

  if (media.length === 0) {
    return NextResponse.json({ status: "no_content" });
  }

  return NextResponse.json({
    campaign_id: campaign.id,
    campaign_name: campaign.name,
    media,
  });
}
