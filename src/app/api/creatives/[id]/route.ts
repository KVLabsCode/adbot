import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { CreativeRow } from "@/lib/supabase/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createServiceClient();

  const result = await supabase
    .from("creatives")
    .update(body as never)
    .eq("id", id)
    .select()
    .single();

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json(result.data as CreativeRow);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  // Delete the creative row
  const { error } = await supabase.from("creatives").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Best-effort asset cleanup
  await supabase.storage
    .from("creative-assets")
    .remove([`org/a0000000-0000-0000-0000-000000000001/${id}`])
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
