export interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  cover_image_url?: string;
}

export interface TripDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  city: string;
  notes?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  day_id: string;
  trip_id: string;
  name: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  order_index: number;
  category?: ActivityCategory;
  created_at: string;
}

export type ActivityCategory =
  | "sightseeing"
  | "food"
  | "transport"
  | "accommodation"
  | "outdoor"
  | "culture"
  | "shopping"
  | "other";

export interface WeatherData {
  date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation_probability: number;
  weather_code: number;
  wind_speed: number;
}

export interface DirectionsResult {
  duration_driving?: number;
  duration_walking?: number;
  duration_transit?: number;
  distance_meters?: number;
  polyline?: string;
}

export interface OptimizedRoute {
  ordered_activities: Activity[];
  total_duration_minutes: number;
  total_distance_meters: number;
  savings_minutes: number;
}

export interface ExcelRow {
  date: string | Date;
  day_number: number;
  city: string;
  activity_name: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  address?: string;
  notes?: string;
}

export interface ParsedItinerary {
  trip_name: string;
  rows: ExcelRow[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  language: string;
  dark_mode: boolean;
  created_at: string;
}

export interface NearbyPlace {
  name: string;
  type: string;
  distance_meters: number;
  rating?: number;
  address: string;
  place_id: string;
}
