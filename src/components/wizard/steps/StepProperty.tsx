"use client";

import { useState, useTransition } from "react";
import { AreaSelectorMap } from "@/components/map/AreaSelectorMap";
import { useBackgroundImageGeneration } from "@/components/wizard/BackgroundImageGeneration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { geocodeAddress, type GeocodingResult } from "@/lib/mapbox/geocoding";
import { savePropertyStep } from "@/lib/actions/properties";
import type { MapBounds, Property } from "@/types/database";

type StepPropertyProps = {
  property: Property;
  onComplete: () => void;
};

export function StepProperty({ property, onComplete }: StepPropertyProps) {
  const { scheduleImageGeneration } = useBackgroundImageGeneration();
  const [query, setQuery] = useState(
    property.address === "Untitled Property" ? "" : property.address
  );
  const [customerName, setCustomerName] = useState(property.customer_name ?? "");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [selected, setSelected] = useState<GeocodingResult | null>(
    property.latitude && property.longitude
      ? {
          address: property.address,
          latitude: property.latitude,
          longitude: property.longitude,
          bounds: property.map_bounds ?? [
            [property.longitude - 0.002, property.latitude - 0.002],
            [property.longitude + 0.002, property.latitude + 0.002],
          ],
        }
      : null
  );
  const [areaBounds, setAreaBounds] = useState<MapBounds | null>(property.map_bounds);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();

  async function handleSearch() {
    setError(null);
    try {
      const found = await geocodeAddress(query);
      setResults(found);
      if (found.length === 0) setError("No addresses found. Try a different search.");
    } catch {
      setError("Geocoding failed. Check your Mapbox token.");
    }
  }

  function handleBoundsChange(bounds: MapBounds | null) {
    setAreaBounds(bounds);
    if (bounds) scheduleImageGeneration(bounds);
  }

  function handleSave() {
    if (!selected) {
      setError("Select a property location first.");
      return;
    }
    if (!areaBounds) {
      setError("Drag on the map to select the property area.");
      return;
    }

    startSaveTransition(async () => {
      try {
        const centerLng = (areaBounds[0][0] + areaBounds[1][0]) / 2;
        const centerLat = (areaBounds[0][1] + areaBounds[1][1]) / 2;

        await savePropertyStep(property.id, {
          address: selected.address,
          customer_name: customerName || undefined,
          latitude: centerLat,
          longitude: centerLng,
          map_bounds: areaBounds,
        });
        scheduleImageGeneration(areaBounds);
        onComplete();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer name (optional)</Label>
            <Input
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Smith Residence"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Property address</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="123 Main St, City, State"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              />
              <Button type="button" variant="secondary" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </div>
          {results.length > 0 && (
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
              {results.map((r) => (
                <li key={r.address}>
                  <button
                    type="button"
                    className={`w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted ${
                      selected?.address === r.address ? "bg-primary/10 font-medium" : ""
                    }`}
                    onClick={() => {
                      setSelected(r);
                      setAreaBounds(null);
                    }}
                  >
                    {r.address}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted-foreground">
            After you drag a box around the property, a polished presentation image starts
            generating automatically while you continue to the next step.
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <AreaSelectorMap
          center={selected ? [selected.longitude, selected.latitude] : undefined}
          initialBounds={areaBounds}
          onBoundsChange={handleBoundsChange}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!selected || !areaBounds || isSaving}>
          {isSaving ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}
