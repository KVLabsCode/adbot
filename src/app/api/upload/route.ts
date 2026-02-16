import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// App Router route segment config
export const maxDuration = 60;

const BUCKET = "creative-assets";
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

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

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 25MB." },
      { status: 413 }
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
