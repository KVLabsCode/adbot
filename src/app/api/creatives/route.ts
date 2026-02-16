import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { CreativeRow } from "@/lib/supabase/types";

const DEMO_ORG_ID = "a0000000-0000-0000-0000-000000000001";

export async function GET() {
  const supabase = createServiceClient();
  const result = await supabase
    .from("creatives")
    .select("*")
    .eq("organization_id", DEMO_ORG_ID)
    .order("created_at", { ascending: false });

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json(result.data as CreativeRow[]);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = createServiceClient();

  const result = await supabase
    .from("creatives")
    .insert(body as never)
    .select()
    .single();

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json(result.data as CreativeRow);
}
