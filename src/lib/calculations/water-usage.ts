import type { VegetationType } from "@/types/database";

const CYCLES_PER_WEEK: Record<VegetationType, number> = {
  turf: 3,
  shrubs: 2,
  trees: 1,
  groundcover: 2,
  mixed: 2.5,
};

export function calculateGallonsPerCycle(gpm: number, runtimeMinutes: number): number {
  return Math.round(gpm * runtimeMinutes);
}

export function calculateWeeklyGallons(
  gpm: number,
  runtimeMinutes: number,
  vegetationType: VegetationType
): number {
  const perCycle = calculateGallonsPerCycle(gpm, runtimeMinutes);
  return Math.round(perCycle * CYCLES_PER_WEEK[vegetationType]);
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
};

export function calculateZoneWaterUsage(
  zone: {
    id: string;
    name: string;
    estimated_gpm: number | null;
    base_runtime_minutes: number | null;
    vegetation_type: VegetationType | null;
  },
  adjustedRuntime?: number
): ZoneWaterUsage | null {
  if (!zone.estimated_gpm || !zone.base_runtime_minutes || !zone.vegetation_type) {
    return null;
  }

  const runtime = adjustedRuntime ?? zone.base_runtime_minutes;
  const gallonsPerCycle = calculateGallonsPerCycle(zone.estimated_gpm, runtime);
  const weeklyGallons = calculateWeeklyGallons(
    zone.estimated_gpm,
    runtime,
    zone.vegetation_type
  );

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    gallonsPerCycle,
    weeklyGallons,
    monthlyGallons: calculateMonthlyGallons(weeklyGallons),
  };
}

export function calculatePropertyMonthlyGallons(usages: ZoneWaterUsage[]): number {
  return usages.reduce((sum, u) => sum + u.monthlyGallons, 0);
}
