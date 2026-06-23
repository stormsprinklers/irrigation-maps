export type VegetationType = "grass" | "shrubs" | "trees" | "flower_bed";
export type ShadeLevel = "full_sun" | "some_shade" | "lots_of_shade";
export type SlopeLevel = "flat" | "moderate" | "steep";
export type SoilType = "sand" | "clay" | "loam";
export type IrrigationType = "spray" | "rotary" | "rotor" | "drip" | "bubbler";
export type PropertyStatus = "draft" | "published" | "archived";

export type GeoJsonPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

export type MapBounds = [[number, number], [number, number]];

export type Profile = {
  id: string;
  company_name: string | null;
  logo_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Property = {
  id: string;
  user_id: string;
  address: string;
  customer_name: string | null;
  latitude: number | null;
  longitude: number | null;
  map_bounds: MapBounds | null;
  stylized_image_url: string | null;
  source_image_url: string | null;
  wizard_step: number;
  status: PropertyStatus;
  share_slug: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type Zone = {
  id: string;
  property_id: string;
  name: string;
  geometry: GeoJsonPolygon;
  vegetation_type: VegetationType | null;
  shade_level: ShadeLevel | null;
  slope_level: SlopeLevel | null;
  soil_type: SoilType | null;
  irrigation_type: IrrigationType | null;
  nozzle_count: number | null;
  nozzle_gpm: number | null;
  estimated_gpm: number | null;
  base_runtime_minutes: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Valve = {
  id: string;
  property_id: string;
  label: string;
  geometry: GeoJsonPoint;
  zone_ids: string[];
  created_at: string;
  updated_at: string;
};

export type Controller = {
  id: string;
  property_id: string;
  label: string;
  geometry: GeoJsonPoint;
  station_count: number;
  controller_model_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ZoneStation = {
  id: string;
  controller_id: string;
  station_number: number;
  zone_id: string;
};

export type PropertyWithRelations = Property & {
  zones: Zone[];
  valves: Valve[];
  controllers: (Controller & { zone_stations: ZoneStation[] })[];
  profile?: Profile | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      properties: {
        Row: Property;
        Insert: Partial<Property> & { user_id: string; address: string };
        Update: Partial<Property>;
      };
      zones: {
        Row: Zone;
        Insert: Partial<Zone> & { property_id: string; name: string; geometry: GeoJsonPolygon };
        Update: Partial<Zone>;
      };
      valves: {
        Row: Valve;
        Insert: Partial<Valve> & { property_id: string; label: string; geometry: GeoJsonPoint };
        Update: Partial<Valve>;
      };
      controllers: {
        Row: Controller;
        Insert: Partial<Controller> & { property_id: string; label: string; geometry: GeoJsonPoint };
        Update: Partial<Controller>;
      };
      zone_stations: {
        Row: ZoneStation;
        Insert: Partial<ZoneStation> & { controller_id: string; station_number: number; zone_id: string };
        Update: Partial<ZoneStation>;
      };
    };
  };
};
