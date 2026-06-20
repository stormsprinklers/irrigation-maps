"use client";

import { useState, useTransition, useRef } from "react";
import { MapEditor, type DraftZone } from "@/components/map/MapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_ZONE_ATTRIBUTES,
  IRRIGATION_TYPES,
  SHADE_LEVELS,
  SLOPE_LEVELS,
  SOIL_TYPES,
  VEGETATION_TYPES,
} from "@/lib/constants";
import { saveZonesStep } from "@/lib/actions/properties";
import type { Property, Zone } from "@/types/database";

type StepZonesProps = {
  property: Property;
  zones: Zone[];
  onComplete: () => void;
};

function zoneFromDb(z: Zone): DraftZone {
  return {
    id: z.id,
    name: z.name,
    geometry: z.geometry,
    vegetation_type: z.vegetation_type ?? DEFAULT_ZONE_ATTRIBUTES.vegetation_type,
    shade_level: z.shade_level ?? DEFAULT_ZONE_ATTRIBUTES.shade_level,
    slope_level: z.slope_level ?? DEFAULT_ZONE_ATTRIBUTES.slope_level,
    soil_type: z.soil_type ?? DEFAULT_ZONE_ATTRIBUTES.soil_type,
    irrigation_type: z.irrigation_type ?? DEFAULT_ZONE_ATTRIBUTES.irrigation_type,
  };
}

export function StepZones({ property, zones: initialZones, onComplete }: StepZonesProps) {
  const [zones, setZones] = useState<DraftZone[]>(initialZones.map(zoneFromDb));
  const [selectedDrawId, setSelectedDrawId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const drawTriggerRef = useRef(0);
  const [, forceDraw] = useState(0);

  const selectedZone =
    zones.find((z) => z.drawId === selectedDrawId) ??
    zones.find((z) => z.id === selectedDrawId) ??
    null;

  function updateSelectedZone(field: keyof DraftZone, value: string) {
    if (!selectedZone) return;
    setZones((prev) =>
      prev.map((z) => {
        const key = z.drawId ?? z.id;
        const selectedKey = selectedZone.drawId ?? selectedZone.id;
        return key === selectedKey ? { ...z, [field]: value } : z;
      })
    );
    if (selectedZone.drawId) {
      // keep draw metadata in sync is handled by MapEditor ref on next draw event
    }
  }

  function handleSave() {
    if (zones.length === 0) {
      setError("Draw at least one zone on the map.");
      return;
    }

    const incomplete = zones.find(
      (z) => !z.name.trim() || !z.vegetation_type || !z.irrigation_type
    );
    if (incomplete) {
      setError("Label every zone and set vegetation and sprinkler type for each.");
      return;
    }

    startTransition(async () => {
      try {
        await saveZonesStep(property.id, {
          zones: zones.map((z) => ({
            id: z.id,
            name: z.name,
            geometry: z.geometry as {
              type: "Polygon";
              coordinates: [number, number][][];
            },
            vegetation_type: z.vegetation_type,
            shade_level: z.shade_level,
            slope_level: z.slope_level,
            soil_type: z.soil_type,
            irrigation_type: z.irrigation_type,
          })),
        });
        onComplete();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save zones");
      }
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Click points to draw a zone boundary, double-click to finish. Draw as many zones as
            needed — click a finished zone to label it.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              drawTriggerRef.current += 1;
              forceDraw((n) => n + 1);
            }}
          >
            Add another zone
          </Button>
        </div>
        <MapEditor
          mode="zones"
          center={
            property.longitude && property.latitude
              ? [property.longitude, property.latitude]
              : undefined
          }
          bounds={property.map_bounds}
          zones={zones}
          selectedZoneId={selectedDrawId}
          onZonesChange={setZones}
          onZoneSelect={setSelectedDrawId}
          drawTrigger={drawTriggerRef.current}
          className="h-[450px] w-full rounded-lg"
        />
      </div>

      <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
        <h3 className="font-medium">Zone details</h3>
        {!selectedZone ? (
          <p className="text-sm text-muted-foreground">
            Select a zone on the map to label it and set conditions.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Zone label</Label>
              <Input
                value={selectedZone.name}
                onChange={(e) => updateSelectedZone("name", e.target.value)}
                placeholder="Front lawn"
              />
            </div>
            <div className="space-y-2">
              <Label>Vegetation type</Label>
              <Select
                value={selectedZone.vegetation_type}
                onValueChange={(v) => v && updateSelectedZone("vegetation_type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VEGETATION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Shade level</Label>
              <Select
                value={selectedZone.shade_level}
                onValueChange={(v) => v && updateSelectedZone("shade_level", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHADE_LEVELS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Slope</Label>
              <Select
                value={selectedZone.slope_level}
                onValueChange={(v) => v && updateSelectedZone("slope_level", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOPE_LEVELS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Soil type</Label>
              <Select
                value={selectedZone.soil_type}
                onValueChange={(v) => v && updateSelectedZone("soil_type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOIL_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sprinkler type</Label>
              <Select
                value={selectedZone.irrigation_type}
                onValueChange={(v) => v && updateSelectedZone("irrigation_type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IRRIGATION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {zones.length > 0 && (
          <div className="border-t pt-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              All zones ({zones.length})
            </p>
            <ul className="space-y-1">
              {zones.map((zone) => (
                <li key={zone.drawId ?? zone.id ?? zone.name}>
                  <button
                    type="button"
                    className={`w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted ${
                      (selectedZone?.drawId ?? selectedZone?.id) === (zone.drawId ?? zone.id)
                        ? "bg-primary/10 font-medium"
                        : ""
                    }`}
                    onClick={() => setSelectedDrawId(zone.drawId ?? zone.id ?? null)}
                  >
                    {zone.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive lg:col-span-3">{error}</p>}
      <div className="flex justify-end lg:col-span-3">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}
