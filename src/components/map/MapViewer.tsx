"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Controller, MapBounds, Valve, Zone, ZoneStation } from "@/types/database";
import { DEFAULT_MAP_CENTER } from "@/lib/constants";
import { zonesToGeoJson, pointsToGeoJson } from "./zone-layer";

type MapViewerProps = {
  center?: [number, number] | null;
  bounds?: MapBounds | null;
  zones: Zone[];
  valves?: Valve[];
  controllers?: (Controller & { zone_stations?: ZoneStation[] })[];
  selectedZoneId?: string | null;
  selectedStationKey?: string | null;
  onZoneSelect?: (zoneId: string | null) => void;
  onStationSelect?: (controllerId: string, stationNumber: number, zoneId: string) => void;
  className?: string;
};

const SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

export function MapViewer({
  center,
  bounds,
  zones,
  valves = [],
  controllers = [],
  selectedZoneId,
  selectedStationKey,
  onZoneSelect,
  onStationSelect,
  className = "h-[500px] w-full rounded-lg",
}: MapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    const mapCenter: [number, number] =
      center ?? (zones[0]?.geometry?.coordinates?.[0]?.[0] as [number, number]) ?? DEFAULT_MAP_CENTER;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: SATELLITE_STYLE,
      center: mapCenter,
      zoom: center ? 18 : 16,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      if (bounds) {
        map.fitBounds(bounds, { padding: 40, maxZoom: 19 });
      } else if (zones.length > 0) {
        const coords = zones.flatMap((z) => z.geometry.coordinates[0]);
        const lngs = coords.map((c) => c[0]);
        const lats = coords.map((c) => c[1]);
        map.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ],
          { padding: 60, maxZoom: 19 }
        );
      }

      map.addSource("zones", { type: "geojson", data: zonesToGeoJson(zones, selectedZoneId) });
      map.addLayer({
        id: "zones-fill",
        type: "fill",
        source: "zones",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": ["case", ["get", "selected"], 0.6, 0.35],
        },
      });
      map.addLayer({
        id: "zones-outline",
        type: "line",
        source: "zones",
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["case", ["get", "selected"], 3, 1.5],
        },
      });

      map.addSource("equipment", {
        type: "geojson",
        data: pointsToGeoJson([
          ...valves.map((v) => ({ ...v, kind: "valve" as const })),
          ...controllers.map((c) => ({ ...c, kind: "controller" as const })),
        ]),
      });
      map.addLayer({
        id: "equipment-circle",
        type: "circle",
        source: "equipment",
        paint: {
          "circle-radius": 8,
          "circle-color": [
            "match",
            ["get", "kind"],
            "valve",
            "#ef4444",
            "controller",
            "#3b82f6",
            "#666",
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const update = () => {
      const zonesSource = map.getSource("zones") as mapboxgl.GeoJSONSource | undefined;
      if (zonesSource) zonesSource.setData(zonesToGeoJson(zones, selectedZoneId));

      const equipmentSource = map.getSource("equipment") as mapboxgl.GeoJSONSource | undefined;
      if (equipmentSource) {
        equipmentSource.setData(
          pointsToGeoJson([
            ...valves.map((v) => ({ ...v, kind: "valve" as const })),
            ...controllers.map((c) => ({ ...c, kind: "controller" as const })),
          ])
        );
      }
    };

    if (map.isStyleLoaded()) update();
    else map.once("load", update);
  }, [zones, valves, controllers, selectedZoneId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onZoneSelect) return;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["zones-fill"] });
      if (features.length > 0 && features[0].properties?.name) {
        const zone = zones.find((z) => z.name === features[0].properties?.name);
        onZoneSelect(zone?.id ?? null);
      } else {
        onZoneSelect(null);
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [onZoneSelect, zones]);

  return <div ref={containerRef} className={className} />;
}
