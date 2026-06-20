import type { GeoJsonPolygon, VegetationType, Zone } from "@/types/database";
import { VEGETATION_COLORS } from "@/lib/constants";

export function getZoneColor(zone: Zone, index: number): string {
  if (zone.vegetation_type) {
    return VEGETATION_COLORS[zone.vegetation_type];
  }
  const fallback = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#06b6d4"];
  return fallback[index % fallback.length];
}

export function zonesToGeoJson(
  zones: Zone[],
  selectedZoneId?: string | null
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: zones.map((zone, index) => ({
      type: "Feature",
      id: zone.id,
      properties: {
        name: zone.name,
        color: getZoneColor(zone, index),
        selected: zone.id === selectedZoneId,
        vegetation_type: zone.vegetation_type,
      },
      geometry: zone.geometry as GeoJsonPolygon,
    })),
  };
}

export function pointsToGeoJson(
  points: { id?: string; label: string; geometry: { type: "Point"; coordinates: [number, number] }; kind: "valve" | "controller" }[],
  selectedId?: string | null
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((p, index) => ({
      type: "Feature",
      id: p.id ?? `${p.kind}-${index}`,
      properties: {
        label: p.label,
        kind: p.kind,
        selected: p.id === selectedId,
      },
      geometry: p.geometry,
    })),
  };
}

export function labelForVegetation(type: VegetationType | null): string {
  if (!type) return "—";
  return type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ");
}

export function labelForEnum(value: string | null): string {
  if (!value) return "—";
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
