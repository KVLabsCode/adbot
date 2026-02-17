import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/supabase/storage";
import type { CampaignRow, CreativeRow } from "@/lib/supabase/types";

export async function GET() {
  const supabase = createServiceClient();

  // 1. Find all active, ready campaigns
  const campaignResult = await supabase
    .from("campaigns")
    .select("*")
    .eq("campaign_ready", true)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const campaigns = (campaignResult.data ?? []) as CampaignRow[];
  if (campaigns.length === 0) {
    return NextResponse.json({ status: "no_content" });
  }

  // 2. Collect all unique creative IDs across campaigns
  const allCreativeIds = [
    ...new Set(campaigns.flatMap((c) => c.creative_ids ?? [])),
  ];
  if (allCreativeIds.length === 0) {
    return NextResponse.json({ status: "no_content" });
  }

  // 3. Fetch all creatives in one query
  const creativeResult = await supabase
    .from("creatives")
    .select("*")
    .in("id", allCreativeIds);

  const creatives = (creativeResult.data ?? []) as CreativeRow[];
  const creativeMap = new Map(creatives.map((c) => [c.id, c]));

  // 4. Build playlist — one entry per campaign/creative pair
  const playlist = [];
  for (const campaign of campaigns) {
    for (const creativeId of campaign.creative_ids ?? []) {
      const creative = creativeMap.get(creativeId);
      if (!creative || !creative.asset_path) continue;

      try {
        const mediaUrl = await getSignedUrl(creative.asset_path, 3600);
        playlist.push({
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          media_type: creative.media_type ?? "image",
          mime_type: creative.mime_type ?? "image/png",
          media_url: mediaUrl,
          duration_seconds: creative.duration_seconds ?? null,
        });
      } catch {
        // Skip creatives with failed signed URLs
      }
    }
  }

  if (playlist.length === 0) {
    return NextResponse.json({ status: "no_content" });
  }

  return NextResponse.json({ playlist });
}
