import { z } from "zod";

export const propertyStepSchema = z.object({
  address: z.string().min(3, "Address is required"),
  customer_name: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  map_bounds: z.tuple([z.tuple([z.number(), z.number()]), z.tuple([z.number(), z.number()])]).optional(),
});

export const zoneGeometrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Zone name is required"),
  geometry: z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
});

export const zonesStepSchema = z.object({
  zones: z.array(zoneGeometrySchema).min(1, "Draw at least one zone"),
});

export const zoneConditionsSchema = z.object({
  id: z.string(),
  vegetation_type: z.enum(["turf", "shrubs", "trees", "groundcover", "mixed"]),
  shade_level: z.enum(["full_sun", "partial_shade", "full_shade"]),
  soil_type: z.enum(["clay", "loam", "sand", "rocky"]),
});

export const conditionsStepSchema = z.object({
  zones: z.array(zoneConditionsSchema),
});

export const zoneIrrigationSchema = z.object({
  id: z.string(),
  irrigation_type: z.enum(["spray", "rotor", "rotary_nozzle", "drip", "bubbler"]),
  nozzle_count: z.number().int().min(1),
  nozzle_gpm: z.number().positive(),
});

export const irrigationStepSchema = z.object({
  zones: z.array(zoneIrrigationSchema),
});

export const valveSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  geometry: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  zone_ids: z.array(z.string()),
});

export const controllerSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  geometry: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  station_count: z.number().int().min(1).max(48),
  stations: z.array(
    z.object({
      station_number: z.number().int().min(1),
      zone_id: z.string(),
    })
  ),
});

export const equipmentStepSchema = z.object({
  valves: z.array(valveSchema),
  controllers: z.array(controllerSchema),
});

export type PropertyStepData = z.infer<typeof propertyStepSchema>;
export type ZonesStepData = z.infer<typeof zonesStepSchema>;
export type ConditionsStepData = z.infer<typeof conditionsStepSchema>;
export type IrrigationStepData = z.infer<typeof irrigationStepSchema>;
export type EquipmentStepData = z.infer<typeof equipmentStepSchema>;
