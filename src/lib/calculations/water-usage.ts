import type { VegetationType } from "@/types/database";
import { calculateDaysPerWeek } from "@/lib/calculations/schedule";
import type { ShadeLevel, SoilType } from "@/types/database";

/**
 * Gallons per cycle = GPM × runtime (minutes).
 * GPM is gallons per minute; multiplying by minutes yields gallons.
 */
export function calculateGallonsPerCycle(gpm: number, runtimeMinutes: number): number {
  return Math.round(gpm * runtimeMinutes);
}

export function calculateWeeklyGallons(
  gpm: number,
  runtimeMinutes: number,
  daysPerWeek: number
): number {
  const perCycle = calculateGallonsPerCycle(gpm, runtimeMinutes);
  return Math.round(perCycle * daysPerWeek);
}

export function calculateMonthlyGallons(weeklyGallons: number): number {
  return Math.round(weeklyGallons * 4.33);
}

export function formatGallons(gallons: number): string {
  if (gallons >= 1000) {
    return `${(gallons / 1000).toFixed(1)}k gal`;
  }
  return `${gallons.toLocaleString()} gal`;
}

export type ZoneWaterUsage = {
  zoneId: string;
  zoneName: string;
  gallonsPerCycle: number;
  weeklyGallons: number;
  monthlyGallons: number;
  daysPerWeek: number;
};

export function calculateZoneWaterUsage(
  zone: {
    id: string;
    name: string;
    estimated_gpm: number | null;
    base_runtime_minutes: number | null;
    vegetation_type: VegetationType | null;
    shade_level?: ShadeLevel | null;
    soil_type?: SoilType | null;
  },
  adjustedRuntime?: number
): ZoneWaterUsage | null {
  if (!zone.estimated_gpm || !zone.base_runtime_minutes || !zone.vegetation_type) {
    return null;
  }

  const runtime = adjustedRuntime ?? zone.base_runtime_minutes;
  const daysPerWeek = calculateDaysPerWeek(
    zone.vegetation_type,
    zone.shade_level ?? "full_sun",
    zone.soil_type ?? "loam"
  );
  const gallonsPerCycle = calculateGallonsPerCycle(zone.estimated_gpm, runtime);
  const weeklyGallons = calculateWeeklyGallons(zone.estimated_gpm, runtime, daysPerWeek);

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    gallonsPerCycle,
    weeklyGallons,
    monthlyGallons: calculateMonthlyGallons(weeklyGallons),
    daysPerWeek,
  };
}

export function calculatePropertyMonthlyGallons(usages: ZoneWaterUsage[]): number {
  return usages.reduce((sum, u) => sum + u.monthlyGallons, 0);
}
