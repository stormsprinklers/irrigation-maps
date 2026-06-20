"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import type {
  GeoJsonPoint,
  GeoJsonPolygon,
  IrrigationType,
  MapBounds,
  ShadeLevel,
  SlopeLevel,
  SoilType,
  VegetationType,
  Zone,
} from "@/types/database";
import { DEFAULT_MAP_CENTER, DEFAULT_ZONE_ATTRIBUTES } from "@/lib/constants";
import { getZoneColor, zonesToGeoJson, pointsToGeoJson } from "./zone-layer";

export type MapEditorMode = "property" | "zones" | "valves" | "controllers" | "view";

export type DraftZone = {
  id?: string;
  drawId?: string;
  name: string;
  geometry: GeoJsonPolygon;
  vegetation_type: VegetationType;
  shade_level: ShadeLevel;
  slope_level: SlopeLevel;
  soil_type: SoilType;
  irrigation_type: IrrigationType;
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
  onZoneSelect?: (zoneKey: string | null) => void;
  onPointSelect?: (pointId: string | null) => void;
  drawTrigger?: number;
  className?: string;
};

const SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

function zoneKey(zone: DraftZone): string {
  return zone.drawId ?? zone.id ?? zone.name;
}

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
  drawTrigger = 0,
  className = "h-[500px] w-full rounded-lg",
}: MapEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const zoneMetaRef = useRef<Map<string, DraftZone>>(new Map());
  const zonesPropRef = useRef(zones);
  zonesPropRef.current = zones;

  useEffect(() => {
    (zones as DraftZone[]).forEach((zone) => {
      if (zone.drawId) zoneMetaRef.current.set(zone.drawId, zone);
    });
  }, [zones]);

  const syncZonesFromDraw = useCallback(() => {
    if (!drawRef.current || !onZonesChange) return;

    const data = drawRef.current.getAll();
    const polygons = data.features.filter((f) => f.geometry.type === "Polygon");

    const draftZones: DraftZone[] = polygons.map((f, index) => {
      const drawId = String(f.id);
      const existing =
        zoneMetaRef.current.get(drawId) ??
        (zonesPropRef.current as DraftZone[]).find((z) => z.drawId === drawId);

      const base: DraftZone = existing ?? {
        name: `Zone ${index + 1}`,
        geometry: f.geometry as GeoJsonPolygon,
        ...DEFAULT_ZONE_ATTRIBUTES,
      };

      const merged: DraftZone = {
        ...base,
        drawId,
        geometry: f.geometry as GeoJsonPolygon,
      };

      zoneMetaRef.current.set(drawId, merged);
      return merged;
    });

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
      controls: { polygon: false, trash: false },
      defaultMode: "simple_select",
    });

    map.on("load", () => {
      if (bounds) {
        map.fitBounds(bounds, { padding: 40, maxZoom: 19 });
      }

      map.addSource("zones-display", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
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
    if (!map) return;

    const fly = () => {
      if (center) map.flyTo({ center, zoom: 18 });
      if (bounds) map.fitBounds(bounds, { padding: 40, maxZoom: 19 });
    };

    if (map.isStyleLoaded()) fly();
    else map.once("load", fly);
  }, [center, bounds]);

  // Zones mode: MapboxDraw only (avoids layer conflicts + enables multi-polygon)
  useEffect(() => {
    const map = mapRef.current;
    const draw = drawRef.current;
    if (!map || !draw) return;

    const onCreate = () => {
      syncZonesFromDraw();
      draw.changeMode("draw_polygon");
    };
    const onUpdate = () => syncZonesFromDraw();
    const onDelete = () => syncZonesFromDraw();
    const onSelectionChange = (e: { features: GeoJSON.Feature[] }) => {
      if (!onZoneSelect) return;
      const feature = e.features[0];
      onZoneSelect(feature?.id != null ? String(feature.id) : null);
    };

    if (mode === "zones") {
      if (!map.hasControl(draw as unknown as mapboxgl.IControl)) {
        map.addControl(draw);
      }

      const draftZones = zonesPropRef.current as DraftZone[];
      if (draftZones.length > 0 && draw.getAll().features.length === 0) {
        draftZones.forEach((zone, index) => {
          const feature = {
            type: "Feature" as const,
            properties: {},
            geometry: zone.geometry,
          };
          const ids = draw.add(feature);
          const drawId = String(Array.isArray(ids) ? ids[0] : ids);
          zoneMetaRef.current.set(drawId, { ...zone, drawId, name: zone.name || `Zone ${index + 1}` });
        });
        syncZonesFromDraw();
        draw.changeMode("simple_select");
      } else if (draw.getAll().features.length === 0) {
        draw.changeMode("draw_polygon");
      }

      map.on("draw.create", onCreate);
      map.on("draw.update", onUpdate);
      map.on("draw.delete", onDelete);
      map.on("draw.selectionchange", onSelectionChange);
    } else {
      if (map.hasControl(draw as unknown as mapboxgl.IControl)) {
        map.removeControl(draw);
      }
    }

    return () => {
      map.off("draw.create", onCreate);
      map.off("draw.update", onUpdate);
      map.off("draw.delete", onDelete);
      map.off("draw.selectionchange", onSelectionChange);
    };
  }, [mode, syncZonesFromDraw, onZoneSelect]);

  useEffect(() => {
    const draw = drawRef.current;
    if (!draw || mode !== "zones" || drawTrigger === 0) return;
    draw.changeMode("draw_polygon");
  }, [drawTrigger, mode]);

  // Non-zones modes: show zones on display layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mode === "zones") return;

    const update = () => {
      const displayZones = zones as Zone[];
      if (!map.getSource("zones-display")) return;

      if (!map.getLayer("zones-display-fill")) {
        map.addLayer({
          id: "zones-display-fill",
          type: "fill",
          source: "zones-display",
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": ["case", ["get", "selected"], 0.55, 0.35],
          },
        });
        map.addLayer({
          id: "zones-display-outline",
          type: "line",
          source: "zones-display",
          paint: {
            "line-color": ["get", "color"],
            "line-width": ["case", ["get", "selected"], 3, 1.5],
          },
        });
      }

      (map.getSource("zones-display") as mapboxgl.GeoJSONSource).setData(
        zonesToGeoJson(displayZones, selectedZoneId)
      );

      const equipmentSource = map.getSource("equipment") as mapboxgl.GeoJSONSource | undefined;
      equipmentSource?.setData(
        pointsToGeoJson(
          [
            ...valves.map((v) => ({ ...v, kind: "valve" as const })),
            ...controllers.map((c) => ({ ...c, kind: "controller" as const })),
          ],
          selectedPointId
        )
      );
    };

    if (map.isStyleLoaded()) update();
    else map.once("load", update);
  }, [mode, zones, valves, controllers, selectedZoneId, selectedPointId]);

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

  return <div ref={containerRef} className={className} />;
}

export { getZoneColor, zoneKey };
