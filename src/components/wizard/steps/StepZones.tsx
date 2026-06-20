"use client";

import { useState, useTransition } from "react";
import { MapEditor, type DraftZone } from "@/components/map/MapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveZonesStep } from "@/lib/actions/properties";
import type { Property, Zone } from "@/types/database";

type StepZonesProps = {
  property: Property;
  zones: Zone[];
  onComplete: () => void;
};

export function StepZones({ property, zones: initialZones, onComplete }: StepZonesProps) {
  const [zones, setZones] = useState<DraftZone[]>(
    initialZones.map((z) => ({ id: z.id, name: z.name, geometry: z.geometry }))
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (zones.length === 0) {
      setError("Draw at least one zone on the map.");
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
          })),
        });
        onComplete();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save zones");
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Use the polygon tool to draw each irrigation zone. Click points to create the boundary, then
        double-click to finish.
      </p>
      <MapEditor
        mode="zones"
        center={
          property.longitude && property.latitude
            ? [property.longitude, property.latitude]
            : undefined
        }
        bounds={property.map_bounds}
        zones={zones as Zone[]}
        onZonesChange={setZones}
        className="h-[450px] w-full rounded-lg"
      />
      {zones.length > 0 && (
        <div className="space-y-2">
          <Label>Zone names</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {zones.map((zone, index) => (
              <Input
                key={index}
                value={zone.name}
                onChange={(e) => {
                  const updated = [...zones];
                  updated[index] = { ...zone, name: e.target.value };
                  setZones(updated);
                }}
                placeholder={`Zone ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}
