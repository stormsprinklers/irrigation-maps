import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createServiceClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabaseSecretKey());
}

export async function uploadPropertyImage(
  userId: string,
  propertyId: string,
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const supabase = createServiceClient();
  const path = `${userId}/${propertyId}/${filename}`;

  const { error } = await supabase.storage.from("property-images").upload(path, buffer, {
    contentType,
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("property-images").getPublicUrl(path);

  return publicUrl;
}
