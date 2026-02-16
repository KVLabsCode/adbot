import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const BUCKET = "creative-assets";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const orgId = formData.get("orgId") as string | null;

  if (!file || !orgId) {
    return NextResponse.json(
      { error: "Missing file or orgId" },
      { status: 400 }
    );
  }

  // Convert File to Buffer for reliable server-side upload
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = createServiceClient();
  const path = `org/${orgId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    console.error("Supabase storage upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ path });
}
