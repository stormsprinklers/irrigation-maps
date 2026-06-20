import type { MapBounds } from "@/types/database";

const STATIC_SIZE = 1024;

export function boundsToBbox(bounds: MapBounds): [number, number, number, number] {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  return [minLng, minLat, maxLng, maxLat];
}

export function buildStaticImageUrl(bounds: MapBounds, token: string): string {
  const [minLng, minLat, maxLng, maxLat] = boundsToBbox(bounds);
  const bbox = `[${minLng},${minLat},${maxLng},${maxLat}]`;
  const style = "mapbox/satellite-v9";
  return `https://api.mapbox.com/styles/v1/${style}/static/${bbox}/${STATIC_SIZE}x${STATIC_SIZE}@2x?access_token=${token}`;
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
