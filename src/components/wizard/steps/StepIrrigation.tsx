"use client";

import { useState, useTransition } from "react";
import { saveIrrigationStep } from "@/lib/actions/properties";
import { IRRIGATION_TYPES } from "@/lib/constants";
import { calculateZoneGpm } from "@/lib/calculations/gpm";
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
import { Badge } from "@/components/ui/badge";
import type { IrrigationType, Zone } from "@/types/database";

type StepIrrigationProps = {
  propertyId: string;
  zones: Zone[];
  onComplete: () => void;
};

type ZoneIrrigation = {
  id: string;
  name: string;
  irrigation_type: IrrigationType;
  nozzle_count: number;
  nozzle_gpm: number;
};

export function StepIrrigation({ propertyId, zones, onComplete }: StepIrrigationProps) {
  const [zoneData, setZoneData] = useState<ZoneIrrigation[]>(
    zones.map((z) => {
      const defaultType = z.irrigation_type ?? "spray";
      const defaultGpm =
        IRRIGATION_TYPES.find((t) => t.value === defaultType)?.defaultGpm ?? 1.5;
      return {
        id: z.id,
        name: z.name,
        irrigation_type: defaultType,
        nozzle_count: z.nozzle_count ?? 4,
        nozzle_gpm: z.nozzle_gpm ?? defaultGpm,
      };
    })
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateZone(id: string, field: keyof ZoneIrrigation, value: string | number | null) {
    if (value === null) return;
    setZoneData((prev) =>
      prev.map((z) => {
        if (z.id !== id) return z;
        const updated = { ...z, [field]: value };
        if (field === "irrigation_type") {
          const defaultGpm =
            IRRIGATION_TYPES.find((t) => t.value === value)?.defaultGpm ?? z.nozzle_gpm;
          updated.nozzle_gpm = defaultGpm;
        }
        return updated;
      })
    );
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveIrrigationStep(propertyId, { zones: zoneData });
        onComplete();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  return (
    <div className="space-y-6">
      {zoneData.map((zone) => {
        const gpm = calculateZoneGpm(zone.nozzle_count, zone.nozzle_gpm);
        return (
          <div key={zone.id} className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium">{zone.name}</h3>
              <Badge variant="secondary">{gpm} GPM</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Irrigation type</Label>
                <Select
                  value={zone.irrigation_type}
                  onValueChange={(v) => updateZone(zone.id, "irrigation_type", v)}
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
              <div className="space-y-2">
                <Label>Nozzle / emitter count</Label>
                <Input
                  type="number"
                  min={1}
                  value={zone.nozzle_count}
                  onChange={(e) =>
                    updateZone(zone.id, "nozzle_count", parseInt(e.target.value) || 1)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>GPM per nozzle</Label>
                <Input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={zone.nozzle_gpm}
                  onChange={(e) =>
                    updateZone(zone.id, "nozzle_gpm", parseFloat(e.target.value) || 0.1)
                  }
                />
              </div>
            </div>
          </div>
        );
      })}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}
