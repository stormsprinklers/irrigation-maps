"use client";

import { useState, useTransition } from "react";
import { saveConditionsStep } from "@/lib/actions/properties";
import { SHADE_LEVELS, SOIL_TYPES, VEGETATION_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShadeLevel, SoilType, VegetationType, Zone } from "@/types/database";

type StepConditionsProps = {
  propertyId: string;
  zones: Zone[];
  onComplete: () => void;
};

type ZoneConditions = {
  id: string;
  name: string;
  vegetation_type: VegetationType;
  shade_level: ShadeLevel;
  soil_type: SoilType;
};

export function StepConditions({ propertyId, zones, onComplete }: StepConditionsProps) {
  const [zoneData, setZoneData] = useState<ZoneConditions[]>(
    zones.map((z) => ({
      id: z.id,
      name: z.name,
      vegetation_type: z.vegetation_type ?? "turf",
      shade_level: z.shade_level ?? "full_sun",
      soil_type: z.soil_type ?? "loam",
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateZone(id: string, field: keyof ZoneConditions, value: string | null) {
    if (!value) return;
    setZoneData((prev) =>
      prev.map((z) => (z.id === id ? { ...z, [field]: value } : z))
    );
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveConditionsStep(propertyId, { zones: zoneData });
        onComplete();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  return (
    <div className="space-y-6">
      {zoneData.map((zone) => (
        <div key={zone.id} className="rounded-lg border p-4">
          <h3 className="mb-4 font-medium">{zone.name}</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Vegetation type</Label>
              <Select
                value={zone.vegetation_type}
                onValueChange={(v) => updateZone(zone.id, "vegetation_type", v)}
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
                value={zone.shade_level}
                onValueChange={(v) => updateZone(zone.id, "shade_level", v)}
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
              <Label>Soil type</Label>
              <Select
                value={zone.soil_type}
                onValueChange={(v) => updateZone(zone.id, "soil_type", v)}
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
          </div>
        </div>
      ))}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}
