import { apiClient } from './client';
import { Token } from '../types';

export interface Scene {
  id: string;
  user_id: string;
  background_asset_id: string | null;
  background_url: string | null;
  grid_config: any;
  fog_data: any;
  image_bounds: any;
  zoom_state: any;
  tokens: Token[];
  effects: any[];
  created_at: string;
  updated_at: string;
}

export interface CreateSceneData {
  background_asset_id?: string;
  grid_config?: any;
  fog_data?: any;
  image_bounds?: any;
  zoom_state?: any;
}

export interface UpdateSceneData {
  background_asset_id?: string;
  grid_config?: any;
  fog_data?: any;
  image_bounds?: any;
  zoom_state?: any;
}

export const scenesApi = {
  async getAll(): Promise<Scene[]> {
    return apiClient.get<Scene[]>('/api/scenes');
  },

  async getById(id: string): Promise<Scene> {
    return apiClient.get<Scene>(`/api/scenes/${id}`);
  },

  async create(data: CreateSceneData): Promise<Scene> {
    return apiClient.post<Scene>('/api/scenes', data);
  },

  async update(id: string, data: UpdateSceneData): Promise<Scene> {
    return apiClient.put<Scene>(`/api/scenes/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/scenes/${id}`);
  },
};

