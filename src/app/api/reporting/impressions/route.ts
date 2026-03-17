import { NextResponse } from "next/server";
import { getImpressionMetrics } from "@/lib/supabase/queries/impressions";

export async function GET() {
  try {
    const metrics = await getImpressionMetrics();
    return NextResponse.json(metrics);
  } catch (err) {
    console.error("Failed to fetch impression metrics:", err);
    return NextResponse.json(
      { error: "Failed to fetch impression metrics" },
      { status: 500 }
    );
  }
}
