"use client";

import { useState, useTransition } from "react";
import { MapEditor, type DraftController, type DraftValve } from "@/components/map/MapEditor";
import { saveEquipmentStep } from "@/lib/actions/properties";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Controller, Property, Valve, Zone } from "@/types/database";

type StepEquipmentProps = {
  property: Property;
  zones: Zone[];
  valves: Valve[];
  controllers: (Controller & { zone_stations: { station_number: number; zone_id: string }[] })[];
  onComplete: () => void;
};

type ControllerDraft = DraftController & {
  station_count: number;
  stations: { station_number: number; zone_id: string }[];
};

export function StepEquipment({
  property,
  zones,
  valves: initialValves,
  controllers: initialControllers,
  onComplete,
}: StepEquipmentProps) {
  const [valves, setValves] = useState<DraftValve[]>(
    initialValves.map((v) => ({
      id: v.id,
      label: v.label,
      geometry: v.geometry,
      zone_ids: v.zone_ids,
    }))
  );
  const [controllers, setControllers] = useState<ControllerDraft[]>(
    initialControllers.map((c) => ({
      id: c.id,
      label: c.label,
      geometry: c.geometry,
      station_count: c.station_count,
      stations: c.zone_stations,
    }))
  );
  const [mapMode, setMapMode] = useState<"valves" | "controllers">("valves");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      try {
        await saveEquipmentStep(property.id, { valves, controllers });
        onComplete();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Tabs value={mapMode} onValueChange={(v) => setMapMode(v as "valves" | "controllers")}>
        <TabsList>
          <TabsTrigger value="valves">Valves ({valves.length})</TabsTrigger>
          <TabsTrigger value="controllers">Controllers ({controllers.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="valves" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the map to place irrigation valves. Link each valve to the zones it serves.
          </p>
        </TabsContent>
        <TabsContent value="controllers" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the map to place controllers, then assign station numbers to zones.
          </p>
        </TabsContent>
      </Tabs>

      <MapEditor
        mode={mapMode}
        center={
          property.longitude && property.latitude
            ? [property.longitude, property.latitude]
            : undefined
        }
        bounds={property.map_bounds}
        zones={zones}
        valves={valves}
        controllers={controllers}
        onValvePlaced={(v) => setValves((prev) => [...prev, v])}
        onControllerPlaced={(c) =>
          setControllers((prev) => [
            ...prev,
            { ...c, station_count: 8, stations: [] },
          ])
        }
        className="h-[350px] w-full rounded-lg"
      />

      {mapMode === "valves" && valves.length > 0 && (
        <div className="space-y-3">
          {valves.map((valve, index) => (
            <div key={index} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Valve label</Label>
                <Input
                  value={valve.label}
                  onChange={(e) => {
                    const updated = [...valves];
                    updated[index] = { ...valve, label: e.target.value };
                    setValves(updated);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Linked zones</Label>
                <Select
                  value={valve.zone_ids[0] ?? ""}
                  onValueChange={(v) => {
                    const updated = [...valves];
                    updated[index] = { ...valve, zone_ids: v ? [v] : [] };
                    setValves(updated);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}

      {mapMode === "controllers" && controllers.length > 0 && (
        <div className="space-y-3">
          {controllers.map((controller, cIndex) => (
            <div key={cIndex} className="rounded-lg border p-3">
              <div className="mb-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Controller label</Label>
                  <Input
                    value={controller.label}
                    onChange={(e) => {
                      const updated = [...controllers];
                      updated[cIndex] = { ...controller, label: e.target.value };
                      setControllers(updated);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Station count</Label>
                  <Input
                    type="number"
                    min={1}
                    max={48}
                    value={controller.station_count}
                    onChange={(e) => {
                      const updated = [...controllers];
                      updated[cIndex] = {
                        ...controller,
                        station_count: parseInt(e.target.value) || 8,
                      };
                      setControllers(updated);
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {Array.from({ length: controller.station_count }, (_, i) => i + 1).map(
                  (stationNum) => {
                    const existing = controller.stations.find(
                      (s) => s.station_number === stationNum
                    );
                    return (
                      <div key={stationNum} className="flex items-center gap-2">
                        <span className="w-16 text-sm text-muted-foreground">
                          St. {stationNum}
                        </span>
                        <Select
                          value={existing?.zone_id ?? ""}
                          onValueChange={(zoneId) => {
                            const updated = [...controllers];
                            const stations = controller.stations.filter(
                              (s) => s.station_number !== stationNum
                            );
                            if (zoneId) {
                              stations.push({ station_number: stationNum, zone_id: zoneId });
                            }
                            updated[cIndex] = { ...controller, stations };
                            setControllers(updated);
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Zone" />
                          </SelectTrigger>
                          <SelectContent>
                            {zones.map((z) => (
                              <SelectItem key={z.id} value={z.id}>
                                {z.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          ))}
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
