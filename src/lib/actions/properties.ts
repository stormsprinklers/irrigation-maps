"use server";

import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { calculateBaseRuntime } from "@/lib/calculations/runtime";
import { calculateZoneGpm } from "@/lib/calculations/gpm";
import type {
  Controller,
  GeoJsonPoint,
  GeoJsonPolygon,
  IrrigationType,
  Property,
  PropertyWithRelations,
  ShadeLevel,
  SlopeLevel,
  SoilType,
  VegetationType,
  Zone,
} from "@/types/database";
import type {
  EquipmentStepData,
  IrrigationStepData,
  PropertyStepData,
  ZonesStepData,
} from "@/lib/validations/property";

const generateSlug = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return { supabase, user };
}

export async function createProperty() {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("properties")
    .insert({ user_id: user.id, address: "Untitled Property" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  return data as Property;
}

export async function getProperty(id: string): Promise<PropertyWithRelations | null> {
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !property) return null;

  const [{ data: zones }, { data: valves }, { data: controllers }] = await Promise.all([
    supabase.from("zones").select("*").eq("property_id", id).order("sort_order"),
    supabase.from("valves").select("*").eq("property_id", id),
    supabase.from("controllers").select("*").eq("property_id", id),
  ]);

  const controllerIds = (controllers ?? []).map((c) => c.id);
  let zoneStations: { controller_id: string; station_number: number; zone_id: string; id: string }[] =
    [];

  if (controllerIds.length > 0) {
    const { data } = await supabase
      .from("zone_stations")
      .select("*")
      .in("controller_id", controllerIds);
    zoneStations = data ?? [];
  }

  return {
    ...(property as Property),
    zones: (zones ?? []) as Zone[],
    valves: valves ?? [],
    controllers: (controllers ?? []).map((c) => ({
      ...(c as Controller),
      zone_stations: zoneStations.filter((zs) => zs.controller_id === c.id),
    })),
  };
}

export async function getPropertyBySlug(slug: string): Promise<PropertyWithRelations | null> {
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("share_slug", slug)
    .eq("is_public", true)
    .single();

  if (error || !property) return null;

  const [{ data: profile }, full] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", property.user_id).single(),
    getProperty(property.id),
  ]);

  if (!full) return null;
  return { ...full, profile: profile ?? null };
}

export async function getDashboardProperties() {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "archived")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Property[];
}

export async function updatePropertyStep(propertyId: string, step: number) {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("properties")
    .update({ wizard_step: step })
    .eq("id", propertyId);

  if (error) throw new Error(error.message);
}

export async function savePropertyStep(propertyId: string, data: PropertyStepData) {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("properties")
    .update({
      address: data.address,
      customer_name: data.customer_name ?? null,
      latitude: data.latitude,
      longitude: data.longitude,
      map_bounds: data.map_bounds ?? null,
      wizard_step: 2,
    })
    .eq("id", propertyId);

  if (error) throw new Error(error.message);
  revalidatePath(`/properties/${propertyId}/edit`);
}

export async function saveZonesStep(propertyId: string, data: ZonesStepData) {
  const { supabase } = await requireUser();

  await supabase.from("zones").delete().eq("property_id", propertyId);

  const inserts = data.zones.map((zone, index) => ({
    property_id: propertyId,
    name: zone.name,
    geometry: zone.geometry as GeoJsonPolygon,
    vegetation_type: zone.vegetation_type,
    shade_level: zone.shade_level,
    slope_level: zone.slope_level,
    soil_type: zone.soil_type,
    irrigation_type: zone.irrigation_type,
    sort_order: index,
  }));

  const { error } = await supabase.from("zones").insert(inserts);
  if (error) throw new Error(error.message);

  await supabase.from("properties").update({ wizard_step: 3 }).eq("id", propertyId);
  revalidatePath(`/properties/${propertyId}/edit`);
}

export async function saveIrrigationStep(propertyId: string, data: IrrigationStepData) {
  const { supabase } = await requireUser();

  const { data: existingZones } = await supabase
    .from("zones")
    .select("id, vegetation_type, shade_level, slope_level, soil_type, irrigation_type")
    .eq("property_id", propertyId);

  const zoneMap = new Map((existingZones ?? []).map((z) => [z.id, z]));

  for (const zone of data.zones) {
    const existing = zoneMap.get(zone.id);
    const estimatedGpm = calculateZoneGpm(zone.nozzle_count, zone.nozzle_gpm);
    const irrigationType = zone.irrigation_type ?? existing?.irrigation_type;

    let baseRuntime = 12;
    if (
      existing?.vegetation_type &&
      existing?.shade_level &&
      existing?.soil_type &&
      irrigationType
    ) {
      baseRuntime = calculateBaseRuntime(
        existing.vegetation_type as VegetationType,
        irrigationType as IrrigationType,
        existing.shade_level as ShadeLevel,
        existing.soil_type as SoilType,
        (existing.slope_level as SlopeLevel) ?? "flat"
      );
    }

    const { error } = await supabase
      .from("zones")
      .update({
        nozzle_count: zone.nozzle_count,
        nozzle_gpm: zone.nozzle_gpm,
        estimated_gpm: estimatedGpm,
        base_runtime_minutes: baseRuntime,
      })
      .eq("id", zone.id);

    if (error) throw new Error(error.message);
  }

  await supabase.from("properties").update({ wizard_step: 4 }).eq("id", propertyId);
  revalidatePath(`/properties/${propertyId}/edit`);
}

export async function saveEquipmentStep(propertyId: string, data: EquipmentStepData) {
  const { supabase } = await requireUser();

  await supabase.from("valves").delete().eq("property_id", propertyId);
  await supabase.from("zone_stations").delete().in(
    "controller_id",
    (
      await supabase.from("controllers").select("id").eq("property_id", propertyId)
    ).data?.map((c) => c.id) ?? []
  );
  await supabase.from("controllers").delete().eq("property_id", propertyId);

  if (data.valves.length > 0) {
    const { error } = await supabase.from("valves").insert(
      data.valves.map((v) => ({
        property_id: propertyId,
        label: v.label,
        geometry: v.geometry as GeoJsonPoint,
        zone_ids: v.zone_ids,
      }))
    );
    if (error) throw new Error(error.message);
  }

  for (const controller of data.controllers) {
    const { data: inserted, error } = await supabase
      .from("controllers")
      .insert({
        property_id: propertyId,
        label: controller.label,
        geometry: controller.geometry as GeoJsonPoint,
        station_count: controller.station_count,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (controller.stations.length > 0) {
      const { error: stationError } = await supabase.from("zone_stations").insert(
        controller.stations.map((s) => ({
          controller_id: inserted.id,
          station_number: s.station_number,
          zone_id: s.zone_id,
        }))
      );
      if (stationError) throw new Error(stationError.message);
    }
  }

  await supabase.from("properties").update({ wizard_step: 5 }).eq("id", propertyId);
  revalidatePath(`/properties/${propertyId}/edit`);
}

export async function publishProperty(propertyId: string) {
  const { supabase } = await requireUser();

  const slug = generateSlug();
  const { error } = await supabase
    .from("properties")
    .update({
      status: "published",
      is_public: true,
      share_slug: slug,
      wizard_step: 5,
    })
    .eq("id", propertyId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath(`/properties/${propertyId}/edit`);
  revalidatePath(`/share/${slug}`);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl}/share/${slug}`;
}

export async function archiveProperty(propertyId: string) {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("properties")
    .update({ status: "archived", is_public: false })
    .eq("id", propertyId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
