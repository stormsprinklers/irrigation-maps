import type { IrrigationType, ShadeLevel, SlopeLevel, SoilType, VegetationType } from "@/types/database";
import { getPrecipitationRate } from "@/lib/calculations/manufacturer-data";
import {
  calculateBaseRuntime,
  calculateDaysPerWeek,
  calculateTargetDepthInches,
  calculateZoneSchedule,
  temperatureFactor,
  type ZoneSchedule,
} from "@/lib/calculations/schedule";

export {
  calculateBaseRuntime,
  calculateDaysPerWeek,
  calculateTargetDepthInches,
  calculateZoneSchedule,
  calculatePropertyStartTimes,
  calculateCycleSoak,
  formatTimeOfDay,
  daysPerWeekLabel,
  DEFAULT_FIRST_START_MINUTES,
  UTAH_WATERING_WINDOW,
  temperatureFactor,
  type ZoneSchedule,
  type CycleSoakPlan,
} from "@/lib/calculations/schedule";

export function calculateAdjustedRuntime(baseRuntimeMinutes: number, temperatureF: number): number {
  return Math.max(1, Math.round(baseRuntimeMinutes * temperatureFactor(temperatureF)));
}

export function formatRuntime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getRuntimeBreakdown(
  vegetationType: VegetationType,
  irrigationType: IrrigationType,
  shadeLevel: ShadeLevel = "full_sun",
  soilType: SoilType = "loam",
  slopeLevel: SlopeLevel = "flat",
  temperatureF = 75
): ZoneSchedule {
  return calculateZoneSchedule({
    vegetationType,
    irrigationType,
    shadeLevel,
    soilType,
    slopeLevel,
    temperatureF,
  });
}

export { getPrecipitationRate };
