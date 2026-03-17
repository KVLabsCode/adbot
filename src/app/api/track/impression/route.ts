import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { insertImpression } from "@/lib/supabase/queries/impressions";
import type { CampaignRow } from "@/lib/supabase/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaign_id, creative_id, device_id } = body;

    if (!campaign_id || !creative_id || !device_id) {
      return NextResponse.json(
        { error: "campaign_id, creative_id, and device_id are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Validate campaign exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, status, budget_cents")
      .eq("id", campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const campaignRow = campaign as CampaignRow;

    if (campaignRow.status !== "active") {
      return NextResponse.json(
        { error: "Campaign is not active" },
        { status: 422 }
      );
    }

    // Revenue formula: (budget_cents / 100) converts to dollars, then / 1000 for per-impression
    const revenuePerImpression = campaignRow.budget_cents / 100_000;

    await insertImpression({
      campaign_id,
      creative_id,
      device_id,
      revenue: revenuePerImpression,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Impression tracking error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
