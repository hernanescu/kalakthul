export interface User {
  id: string;
  email: string;
  subscription_tier: string;
  created_at: Date;
  updated_at: Date;
}

export interface Asset {
  id: string;
  user_id: string;
  type: 'map' | 'token';
  storage_url: string;
  thumbnail_url: string | null;
  name: string | null;
  folder_id: string | null;
  dimensions: { width: number; height: number } | null;
  original_size: number | null;
  compressed_size: number | null;
  created_at: Date;
  last_used: Date;
}

export interface Scene {
  id: string;
  user_id: string;
  background_asset_id: string | null;
  grid_config: any;
  fog_data: any;
  image_bounds: any;
  zoom_state: any;
  created_at: Date;
  updated_at: Date;
}

export interface ActiveToken {
  id: string;
  scene_id: string;
  asset_id: string | null;
  x: number;
  y: number;
  grid_x: number | null;
  grid_y: number | null;
  width: number | null;
  height: number | null;
  name: string | null;
  opacity: number;
  properties: any;
  created_at: Date;
  updated_at: Date;
}

export interface Effect {
  id: string;
  scene_id: string;
  type: string;
  x: number;
  y: number;
  grid_x: number | null;
  grid_y: number | null;
  width: number;
  height: number;
  shape: string;
  opacity: number;
  animation_url: string | null;
  created_at: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

