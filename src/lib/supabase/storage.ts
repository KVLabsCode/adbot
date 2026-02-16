import { createServiceClient } from "./server";

const BUCKET = "creative-assets";

export async function uploadCreativeAsset(
  orgId: string,
  fileName: string,
  file: File | Blob
): Promise<string> {
  const supabase = createServiceClient();
  const path = `org/${orgId}/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
  });

  if (error) {
    console.error("Failed to upload creative asset:", error);
    throw error;
  }
  return path;
}

export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error("Failed to get signed URL:", error);
    throw error;
  }
  return data.signedUrl;
}

export async function deleteAsset(path: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    console.error("Failed to delete asset:", error);
    throw error;
  }
}
