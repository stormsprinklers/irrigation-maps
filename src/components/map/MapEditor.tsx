"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import type { GeoJsonPoint, GeoJsonPolygon, MapBounds, Zone } from "@/types/database";
import { DEFAULT_MAP_CENTER } from "@/lib/constants";
import { getZoneColor, zonesToGeoJson, pointsToGeoJson } from "./zone-layer";

export type MapEditorMode = "property" | "zones" | "valves" | "controllers" | "view";

export type DraftZone = {
  id?: string;
  name: string;
  geometry: GeoJsonPolygon;
};

export type DraftValve = {
  id?: string;
  label: string;
  geometry: GeoJsonPoint;
  zone_ids: string[];
};

export type DraftController = {
  id?: string;
  label: string;
  geometry: GeoJsonPoint;
};

type MapEditorProps = {
  mode: MapEditorMode;
  center?: [number, number];
  bounds?: MapBounds | null;
  zones?: DraftZone[] | Zone[];
  valves?: DraftValve[];
  controllers?: DraftController[];
  selectedZoneId?: string | null;
  selectedPointId?: string | null;
  onZonesChange?: (zones: DraftZone[]) => void;
  onValvePlaced?: (valve: DraftValve) => void;
  onControllerPlaced?: (controller: DraftController) => void;
  onZoneSelect?: (zoneId: string | null) => void;
  onPointSelect?: (pointId: string | null) => void;
  className?: string;
};

const SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

export function MapEditor({
  mode,
  center,
  bounds,
  zones = [],
  valves = [],
  controllers = [],
  selectedZoneId,
  selectedPointId,
  onZonesChange,
  onValvePlaced,
  onControllerPlaced,
  onZoneSelect,
  onPointSelect,
  className = "h-[500px] w-full rounded-lg",
}: MapEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const handleDrawUpdate = useCallback(() => {
    if (!drawRef.current || !onZonesChange) return;
    const data = drawRef.current.getAll();
    const draftZones: DraftZone[] = data.features
      .filter((f) => f.geometry.type === "Polygon")
      .map((f, index) => ({
        id: f.id as string | undefined,
        name: `Zone ${index + 1}`,
        geometry: f.geometry as GeoJsonPolygon,
      }));
    onZonesChange(draftZones);
  }, [onZonesChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    const mapCenter = center ?? DEFAULT_MAP_CENTER;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: SATELLITE_STYLE,
      center: mapCenter,
      zoom: center ? 18 : 4,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: false,
        trash: false,
      },
      defaultMode: "simple_select",
    });

    map.on("load", () => {
      if (bounds) {
        map.fitBounds(bounds, { padding: 40, maxZoom: 19 });
      }

      map.addSource("zones", {
        type: "geojson",
        data: zonesToGeoJson(zones as Zone[]),
      });

      map.addLayer({
        id: "zones-fill",
        type: "fill",
        source: "zones",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": ["case", ["get", "selected"], 0.55, 0.35],
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
        data: pointsToGeoJson([]),
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
    drawRef.current = draw;

    return () => {
      map.remove();
      mapRef.current = null;
      drawRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (center) {
      map.flyTo({ center, zoom: 18 });
    }
    if (bounds) {
      map.fitBounds(bounds, { padding: 40, maxZoom: 19 });
    }
  }, [center, bounds]);

  useEffect(() => {
    const map = mapRef.current;
    const draw = drawRef.current;
    if (!map) return;

    const updateLayers = () => {
      const zonesSource = map.getSource("zones") as mapboxgl.GeoJSONSource | undefined;
      if (zonesSource) {
        zonesSource.setData(zonesToGeoJson(zones as Zone[], selectedZoneId));
      }

      const equipmentSource = map.getSource("equipment") as mapboxgl.GeoJSONSource | undefined;
      if (equipmentSource) {
        equipmentSource.setData(
          pointsToGeoJson(
            [
              ...valves.map((v) => ({ ...v, kind: "valve" as const })),
              ...controllers.map((c) => ({ ...c, kind: "controller" as const })),
            ],
            selectedPointId
          )
        );
      }
    };

    if (map.isStyleLoaded()) {
      updateLayers();
    } else {
      map.once("load", updateLayers);
    }
  }, [zones, valves, controllers, selectedZoneId, selectedPointId]);

  useEffect(() => {
    const map = mapRef.current;
    const draw = drawRef.current;
    if (!map || !draw) return;

    if (mode === "zones") {
      if (!map.hasControl(draw as unknown as mapboxgl.IControl)) {
        map.addControl(draw);
      }
      draw.changeMode("draw_polygon");
      map.on("draw.create", handleDrawUpdate);
      map.on("draw.update", handleDrawUpdate);
      map.on("draw.delete", handleDrawUpdate);
    } else {
      if (map.hasControl(draw as unknown as mapboxgl.IControl)) {
        map.removeControl(draw);
      }
    }

    return () => {
      map.off("draw.create", handleDrawUpdate);
      map.off("draw.update", handleDrawUpdate);
      map.off("draw.delete", handleDrawUpdate);
    };
  }, [mode, handleDrawUpdate]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || (mode !== "valves" && mode !== "controllers")) return;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      if (mode === "valves" && onValvePlaced) {
        onValvePlaced({
          label: `Valve ${valves.length + 1}`,
          geometry: { type: "Point", coordinates: coords },
          zone_ids: [],
        });
      }
      if (mode === "controllers" && onControllerPlaced) {
        onControllerPlaced({
          label: `Controller ${controllers.length + 1}`,
          geometry: { type: "Point", coordinates: coords },
        });
      }
    };

    map.getCanvas().style.cursor = "crosshair";
    map.on("click", handleClick);

    return () => {
      map.getCanvas().style.cursor = "";
      map.off("click", handleClick);
    };
  }, [mode, valves.length, controllers.length, onValvePlaced, onControllerPlaced]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onZoneSelect) return;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["zones-fill"] });
      if (features.length > 0 && features[0].id) {
        onZoneSelect(String(features[0].id));
      } else {
        onZoneSelect(null);
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [onZoneSelect]);

  return <div ref={containerRef} className={className} />;
}

export { getZoneColor };
