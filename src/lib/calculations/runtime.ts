import type { IrrigationType, ShadeLevel, SoilType, VegetationType } from "@/types/database";

const BASE_RUNTIME: Record<VegetationType, Record<IrrigationType, number>> = {
  turf: { spray: 12, rotor: 18, rotary_nozzle: 15, drip: 45, bubbler: 20 },
  shrubs: { spray: 10, rotor: 15, rotary_nozzle: 12, drip: 40, bubbler: 18 },
  trees: { spray: 15, rotor: 22, rotary_nozzle: 18, drip: 60, bubbler: 25 },
  groundcover: { spray: 8, rotor: 12, rotary_nozzle: 10, drip: 35, bubbler: 15 },
  mixed: { spray: 11, rotor: 16, rotary_nozzle: 13, drip: 42, bubbler: 19 },
};

const SHADE_MODIFIER: Record<ShadeLevel, number> = {
  full_sun: 1.0,
  partial_shade: 0.75,
  full_shade: 0.55,
};

const SOIL_MODIFIER: Record<SoilType, number> = {
  sand: 1.15,
  loam: 1.0,
  clay: 0.85,
  rocky: 0.9,
};

const REFERENCE_TEMP_F = 70;

export function calculateBaseRuntime(
  vegetationType: VegetationType,
  irrigationType: IrrigationType,
  shadeLevel: ShadeLevel = "full_sun",
  soilType: SoilType = "loam"
): number {
  const base = BASE_RUNTIME[vegetationType][irrigationType];
  const adjusted = base * SHADE_MODIFIER[shadeLevel] * SOIL_MODIFIER[soilType];
  return Math.round(adjusted);
}

export function temperatureFactor(temperatureF: number): number {
  const delta = temperatureF - REFERENCE_TEMP_F;
  const factor = 1 + delta * 0.02;
  return Math.max(0.5, Math.min(2.0, factor));
}

export function calculateAdjustedRuntime(baseRuntimeMinutes: number, temperatureF: number): number {
  return Math.round(baseRuntimeMinutes * temperatureFactor(temperatureF));
}

export function formatRuntime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
