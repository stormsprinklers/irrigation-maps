"use server";

import { revalidatePath } from "next/cache";
import { fetchSatelliteScreenshot } from "@/lib/mapbox/static-image";
import { stylizePropertyImage } from "@/lib/openai/stylize-property-image";
import { uploadPropertyImage } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";
import type { MapBounds } from "@/types/database";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return { supabase, user };
}

export async function generateStylizedPropertyImage(
  propertyId: string,
  bounds: MapBounds
): Promise<{ stylizedImageUrl: string; sourceImageUrl: string }> {
  const { supabase, user } = await requireUser();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, user_id")
    .eq("id", propertyId)
    .single();

  if (propertyError || !property) throw new Error("Property not found");
  if (property.user_id !== user.id) throw new Error("Unauthorized");

  const sourceBuffer = await fetchSatelliteScreenshot(bounds);
  const sourceImageUrl = await uploadPropertyImage(
    user.id,
    propertyId,
    "source.png",
    sourceBuffer,
    "image/png"
  );

  const { imageBuffer } = await stylizePropertyImage(sourceBuffer);
  const stylizedImageUrl = await uploadPropertyImage(
    user.id,
    propertyId,
    "stylized.png",
    imageBuffer,
    "image/png"
  );

  const centerLng = (bounds[0][0] + bounds[1][0]) / 2;
  const centerLat = (bounds[0][1] + bounds[1][1]) / 2;

  const { error: updateError } = await supabase
    .from("properties")
    .update({
      map_bounds: bounds,
      latitude: centerLat,
      longitude: centerLng,
      source_image_url: sourceImageUrl,
      stylized_image_url: stylizedImageUrl,
    })
    .eq("id", propertyId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/properties/${propertyId}/edit`);

  return { stylizedImageUrl, sourceImageUrl };
}
