"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapBounds } from "@/types/database";
import { DEFAULT_MAP_CENTER } from "@/lib/constants";

type AreaSelectorMapProps = {
  center?: [number, number];
  initialBounds?: MapBounds | null;
  onBoundsChange?: (bounds: MapBounds | null) => void;
  className?: string;
};

function normalizeBounds(
  start: mapboxgl.LngLat,
  end: mapboxgl.LngLat
): MapBounds {
  return [
    [Math.min(start.lng, end.lng), Math.min(start.lat, end.lat)],
    [Math.max(start.lng, end.lng), Math.max(start.lat, end.lat)],
  ];
}

function boundsToFeature(bounds: MapBounds): GeoJSON.Feature {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat],
        ],
      ],
    },
  };
}

const SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

export function AreaSelectorMap({
  center,
  initialBounds,
  onBoundsChange,
  className = "h-[420px] w-full rounded-lg",
}: AreaSelectorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawingRef = useRef(false);
  const startRef = useRef<mapboxgl.LngLat | null>(null);
  const [selectedBounds, setSelectedBounds] = useState<MapBounds | null>(initialBounds ?? null);

  const updateBounds = useCallback(
    (bounds: MapBounds | null) => {
      setSelectedBounds(bounds);
      onBoundsChange?.(bounds);
    },
    [onBoundsChange]
  );

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

    map.on("load", () => {
      map.addSource("selection", {
        type: "geojson",
        data: initialBounds
          ? { type: "FeatureCollection", features: [boundsToFeature(initialBounds)] }
          : { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "selection-fill",
        type: "fill",
        source: "selection",
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.2,
        },
      });

      map.addLayer({
        id: "selection-outline",
        type: "line",
        source: "selection",
        paint: {
          "line-color": "#2563eb",
          "line-width": 2,
          "line-dasharray": [2, 1],
        },
      });

      if (initialBounds) {
        map.fitBounds(initialBounds, { padding: 40, maxZoom: 19 });
      }
    });

    const onMouseDown = (e: mapboxgl.MapMouseEvent) => {
      if (e.originalEvent.button !== 0) return;
      drawingRef.current = true;
      startRef.current = e.lngLat;
      map.getCanvas().style.cursor = "crosshair";
      map.dragPan.disable();
    };

    const onMouseMove = (e: mapboxgl.MapMouseEvent) => {
      if (!drawingRef.current || !startRef.current) return;
      const bounds = normalizeBounds(startRef.current, e.lngLat);
      const source = map.getSource("selection") as mapboxgl.GeoJSONSource | undefined;
      source?.setData({
        type: "FeatureCollection",
        features: [boundsToFeature(bounds)],
      });
    };

    const onMouseUp = (e: mapboxgl.MapMouseEvent) => {
      if (!drawingRef.current || !startRef.current) return;
      drawingRef.current = false;
      map.getCanvas().style.cursor = "";
      map.dragPan.enable();

      const bounds = normalizeBounds(startRef.current, e.lngLat);
      startRef.current = null;

      const lngSpan = bounds[1][0] - bounds[0][0];
      const latSpan = bounds[1][1] - bounds[0][1];
      if (lngSpan < 0.0001 || latSpan < 0.0001) {
        return;
      }

      updateBounds(bounds);
    };

    map.on("mousedown", onMouseDown);
    map.on("mousemove", onMouseMove);
    map.on("mouseup", onMouseUp);

    mapRef.current = map;

    return () => {
      map.off("mousedown", onMouseDown);
      map.off("mousemove", onMouseMove);
      map.off("mouseup", onMouseUp);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center) return;

    if (map.isStyleLoaded()) {
      map.flyTo({ center, zoom: 18 });
    } else {
      map.once("load", () => map.flyTo({ center, zoom: 18 }));
    }
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !initialBounds) return;

    const apply = () => {
      const source = map.getSource("selection") as mapboxgl.GeoJSONSource | undefined;
      source?.setData({
        type: "FeatureCollection",
        features: [boundsToFeature(initialBounds)],
      });
      map.fitBounds(initialBounds, { padding: 40, maxZoom: 19 });
    };

    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [initialBounds]);

  return (
    <div className="space-y-2">
      <div ref={containerRef} className={className} />
      <p className="text-xs text-muted-foreground">
        Click and drag on the map to select the property area.
        {selectedBounds ? " Area selected." : " No area selected yet."}
      </p>
    </div>
  );
}

export { normalizeBounds };
