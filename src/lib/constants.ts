import type { IrrigationType, ShadeLevel, SoilType, VegetationType } from "@/types/database";

export const VEGETATION_TYPES: { value: VegetationType; label: string }[] = [
  { value: "turf", label: "Turf / Lawn" },
  { value: "shrubs", label: "Shrubs" },
  { value: "trees", label: "Trees" },
  { value: "groundcover", label: "Ground Cover" },
  { value: "mixed", label: "Mixed Plantings" },
];

export const SHADE_LEVELS: { value: ShadeLevel; label: string }[] = [
  { value: "full_sun", label: "Full Sun" },
  { value: "partial_shade", label: "Partial Shade" },
  { value: "full_shade", label: "Full Shade" },
];

export const SOIL_TYPES: { value: SoilType; label: string }[] = [
  { value: "clay", label: "Clay" },
  { value: "loam", label: "Loam" },
  { value: "sand", label: "Sand" },
  { value: "rocky", label: "Rocky" },
];

export const IRRIGATION_TYPES: { value: IrrigationType; label: string; defaultGpm: number }[] = [
  { value: "spray", label: "Spray Heads", defaultGpm: 1.5 },
  { value: "rotor", label: "Rotors", defaultGpm: 2.5 },
  { value: "rotary_nozzle", label: "Rotary Nozzles", defaultGpm: 0.6 },
  { value: "drip", label: "Drip", defaultGpm: 0.5 },
  { value: "bubbler", label: "Bubblers", defaultGpm: 0.25 },
];

export const WIZARD_STEPS = [
  { step: 1, title: "Property", description: "Locate the property on the map" },
  { step: 2, title: "Zones", description: "Draw irrigation zones" },
  { step: 3, title: "Conditions", description: "Vegetation, shade, and soil" },
  { step: 4, title: "Irrigation", description: "Head types and flow rates" },
  { step: 5, title: "Equipment", description: "Valves and controllers" },
  { step: 6, title: "Review", description: "Publish and share" },
] as const;

export const VALVE_CAPACITY_GPM = 18;

export const VEGETATION_COLORS: Record<VegetationType, string> = {
  turf: "#22c55e",
  shrubs: "#84cc16",
  trees: "#15803d",
  groundcover: "#a3e635",
  mixed: "#eab308",
};

export const DEFAULT_MAP_CENTER: [number, number] = [-98.5795, 39.8283];
