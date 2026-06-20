import type { MapBounds } from "@/types/database";

const MAX_DIMENSION = 1280;
const MIN_DIMENSION = 256;

export function boundsToBbox(bounds: MapBounds): [number, number, number, number] {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  return [minLng, minLat, maxLng, maxLat];
}

/** Match image aspect ratio to selection so Mapbox doesn't pad extra map area. */
export function getStaticImageDimensions(bounds: MapBounds): { width: number; height: number } {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  const latCenter = (minLat + maxLat) / 2;
  const lngSpan = maxLng - minLng;
  const latSpan = maxLat - minLat;

  const latRad = (latCenter * Math.PI) / 180;
  const adjustedLngSpan = lngSpan * Math.cos(latRad);
  const aspect = adjustedLngSpan / Math.max(latSpan, 0.00001);

  let width: number;
  let height: number;

  if (aspect >= 1) {
    width = MAX_DIMENSION;
    height = Math.round(MAX_DIMENSION / aspect);
  } else {
    height = MAX_DIMENSION;
    width = Math.round(MAX_DIMENSION * aspect);
  }

  width = Math.max(MIN_DIMENSION, Math.min(1280, width));
  height = Math.max(MIN_DIMENSION, Math.min(1280, height));

  return { width, height };
}

export function buildStaticImageUrl(bounds: MapBounds, token: string): string {
  const [minLng, minLat, maxLng, maxLat] = boundsToBbox(bounds);
  const { width, height } = getStaticImageDimensions(bounds);
  const bbox = `[${minLng},${minLat},${maxLng},${maxLat}]`;
  const style = "mapbox/satellite-v9";
  return `https://api.mapbox.com/styles/v1/${style}/static/${bbox}/${width}x${height}@2x?access_token=${token}`;
}

export async function fetchSatelliteScreenshot(bounds: MapBounds): Promise<Buffer> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) throw new Error("Mapbox token not configured");

  const url = buildStaticImageUrl(bounds, token);
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch Mapbox static image (${res.status})`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
