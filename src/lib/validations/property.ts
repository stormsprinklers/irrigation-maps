import { z } from "zod";

export const propertyStepSchema = z.object({
  address: z.string().min(3, "Address is required"),
  customer_name: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  map_bounds: z
    .tuple([z.tuple([z.number(), z.number()]), z.tuple([z.number(), z.number()])])
    .optional(),
});

export const zoneWithAttributesSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Zone name is required"),
  geometry: z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
  vegetation_type: z.enum(["grass", "shrubs", "trees", "flower_bed"]),
  shade_level: z.enum(["full_sun", "some_shade", "lots_of_shade"]),
  slope_level: z.enum(["flat", "moderate", "steep"]),
  soil_type: z.enum(["sand", "clay", "loam"]),
  irrigation_type: z.enum(["spray", "rotary", "rotor", "drip", "bubbler"]),
});

export const zonesStepSchema = z.object({
  zones: z.array(zoneWithAttributesSchema).min(1, "Draw at least one zone"),
});

export const zoneIrrigationSchema = z.object({
  id: z.string(),
  irrigation_type: z.enum(["spray", "rotary", "rotor", "drip", "bubbler"]),
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
  controller_model_id: z.string().nullable().optional(),
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
export type IrrigationStepData = z.infer<typeof irrigationStepSchema>;
export type EquipmentStepData = z.infer<typeof equipmentStepSchema>;
