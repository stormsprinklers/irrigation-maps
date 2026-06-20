"use client";

import { useState } from "react";
import Image from "next/image";
import { MapViewer } from "@/components/map/MapViewer";
import { labelForEnum } from "@/components/map/zone-layer";
import {
  calculateAdjustedRuntime,
  formatRuntime,
} from "@/lib/calculations/runtime";
import {
  calculatePropertyMonthlyGallons,
  calculateZoneWaterUsage,
  formatGallons,
} from "@/lib/calculations/water-usage";
import { calculatePropertyTotalGpm } from "@/lib/calculations/gpm";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PropertyWithRelations } from "@/types/database";

type ShareViewProps = {
  property: PropertyWithRelations;
};

export function ShareView({ property }: ShareViewProps) {
  const [temperature, setTemperature] = useState(75);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const totalGpm = calculatePropertyTotalGpm(
    property.zones.map((z) => z.estimated_gpm ?? 0)
  );

  const zoneUsages = property.zones.map((zone) => {
    const adjustedRuntime = zone.base_runtime_minutes
      ? calculateAdjustedRuntime(zone.base_runtime_minutes, temperature)
      : undefined;
    return {
      zone,
      usage: calculateZoneWaterUsage(zone, adjustedRuntime),
      adjustedRuntime,
    };
  });

  const monthlyTotal = calculatePropertyMonthlyGallons(
    zoneUsages.map((z) => z.usage).filter(Boolean) as NonNullable<
      ReturnType<typeof calculateZoneWaterUsage>
    >[]
  );

  function handleStationSelect(controllerId: string, stationNumber: number, zoneId: string) {
    setSelectedStation(`${controllerId}-${stationNumber}`);
    setSelectedZoneId(zoneId);
  }

  const selectedZone = property.zones.find((z) => z.id === selectedZoneId);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{property.address}</h1>
        {property.customer_name && (
          <p className="text-muted-foreground">{property.customer_name}</p>
        )}
      </div>

      {property.stylized_image_url && (
        <div className="overflow-hidden rounded-xl border shadow-sm">
          <Image
            src={property.stylized_image_url}
            alt={`Aerial view of ${property.address}`}
            width={1200}
            height={600}
            className="h-auto max-h-80 w-full object-cover"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MapViewer
            center={
              property.longitude && property.latitude
                ? [property.longitude, property.latitude]
                : null
            }
            bounds={property.map_bounds}
            zones={property.zones}
            valves={property.valves}
            controllers={property.controllers}
            selectedZoneId={selectedZoneId}
            onZoneSelect={setSelectedZoneId}
            className="h-[400px] w-full rounded-lg lg:h-[500px]"
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">System Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total flow</span>
                <span className="font-medium">{totalGpm} GPM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zones</span>
                <span className="font-medium">{property.zones.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. monthly usage</span>
                <span className="font-medium">{formatGallons(monthlyTotal)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Temperature Adjustment</CardTitle>
              <CardDescription>
                Adjust runtimes based on current conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <Label>Temperature</Label>
                <Badge variant="secondary">{temperature}°F</Badge>
              </div>
              <Slider
                value={[temperature]}
                onValueChange={(v) => setTemperature(Array.isArray(v) ? v[0] : v)}
                min={50}
                max={100}
                step={1}
              />
            </CardContent>
          </Card>

          {selectedZone && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{selectedZone.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vegetation</span>
                  <span>{labelForEnum(selectedZone.vegetation_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shade</span>
                  <span>{labelForEnum(selectedZone.shade_level)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GPM</span>
                  <span>{selectedZone.estimated_gpm ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suggested runtime</span>
                  <span>
                    {selectedZone.base_runtime_minutes
                      ? formatRuntime(
                          calculateAdjustedRuntime(
                            selectedZone.base_runtime_minutes,
                            temperature
                          )
                        )
                      : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zone Breakdown</CardTitle>
          <CardDescription>
            Click a zone on the map or select a controller station below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone</TableHead>
                <TableHead>Vegetation</TableHead>
                <TableHead>Shade</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">GPM</TableHead>
                <TableHead className="text-right">Runtime</TableHead>
                <TableHead className="text-right">Monthly</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zoneUsages.map(({ zone, usage, adjustedRuntime }) => (
                <TableRow
                  key={zone.id}
                  className={selectedZoneId === zone.id ? "bg-muted/50" : "cursor-pointer"}
                  onClick={() => setSelectedZoneId(zone.id)}
                >
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>{labelForEnum(zone.vegetation_type)}</TableCell>
                  <TableCell>{labelForEnum(zone.shade_level)}</TableCell>
                  <TableCell>{labelForEnum(zone.irrigation_type)}</TableCell>
                  <TableCell className="text-right">{zone.estimated_gpm ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {adjustedRuntime ? formatRuntime(adjustedRuntime) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {usage ? formatGallons(usage.monthlyGallons) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {property.controllers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Controller Stations</CardTitle>
            <CardDescription>
              Select a station to highlight its zone on the map
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {property.controllers.map((controller) => (
                <div key={controller.id} className="rounded-lg border p-3">
                  <p className="mb-2 font-medium">{controller.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {controller.zone_stations.map((station) => {
                      const zone = property.zones.find((z) => z.id === station.zone_id);
                      const key = `${controller.id}-${station.station_number}`;
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`rounded-md px-2 py-1 text-xs ${
                            selectedStation === key
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                          onClick={() =>
                            handleStationSelect(
                              controller.id,
                              station.station_number,
                              station.zone_id
                            )
                          }
                        >
                          St.{station.station_number}: {zone?.name ?? "?"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {property.valves.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Valve Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {property.valves.map((valve) => (
                <Badge key={valve.id} variant="outline">
                  {valve.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
