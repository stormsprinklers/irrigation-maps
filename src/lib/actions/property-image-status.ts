"use server";

import { createClient } from "@/lib/supabase/server";
import type { MapBounds } from "@/types/database";

export async function getPropertyImageStatus(propertyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("properties")
    .select("stylized_image_url, map_bounds, user_id")
    .eq("id", propertyId)
    .single();

  if (error || !data) throw new Error("Property not found");
  if (data.user_id !== user.id) throw new Error("Unauthorized");

  return {
    stylizedImageUrl: data.stylized_image_url as string | null,
    mapBounds: data.map_bounds as MapBounds | null,
  };
}
