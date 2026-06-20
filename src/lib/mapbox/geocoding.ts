export type GeocodingResult = {
  address: string;
  latitude: number;
  longitude: number;
  bounds: [[number, number], [number, number]];
};

export async function geocodeAddress(query: string): Promise<GeocodingResult[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) throw new Error("Mapbox token not configured");

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("types", "address,place");
  url.searchParams.set("limit", "5");
  url.searchParams.set("country", "us");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Geocoding failed");

  const data = await res.json();
  return (data.features ?? []).map(
    (feature: {
      place_name: string;
      center: [number, number];
      bbox?: [number, number, number, number];
    }) => {
      const [lng, lat] = feature.center;
      let bounds: [[number, number], [number, number]];

      if (feature.bbox) {
        const [minLng, minLat, maxLng, maxLat] = feature.bbox;
        bounds = [
          [minLng, minLat],
          [maxLng, maxLat],
        ];
      } else {
        const pad = 0.002;
        bounds = [
          [lng - pad, lat - pad],
          [lng + pad, lat + pad],
        ];
      }

      return {
        address: feature.place_name,
        latitude: lat,
        longitude: lng,
        bounds,
      };
    }
  );
}
