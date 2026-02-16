import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const BUCKET = "creative-assets";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/mp4",
  "video/webm",
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { orgId, fileName, contentType } = body as {
    orgId?: string;
    fileName?: string;
    contentType?: string;
  };

  if (!orgId || !fileName || !contentType) {
    return NextResponse.json(
      { error: "Missing orgId, fileName, or contentType" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: "Unsupported file type" },
      { status: 400 }
    );
  }

  const path = `org/${orgId}/${Date.now()}-${fileName}`;
  const supabase = createServiceClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error) {
    console.error("Failed to create signed upload URL:", error);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    path,
    token: data.token,
  });
}
