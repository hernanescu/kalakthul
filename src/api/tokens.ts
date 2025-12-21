import { apiClient } from './client';

export interface ActiveToken {
  id: string;
  scene_id: string;
  asset_id: string | null;
  token_image_url: string | null;
  x: number;
  y: number;
  grid_x: number | null;
  grid_y: number | null;
  width: number | null;
  height: number | null;
  name: string | null;
  opacity: number;
  properties: any;
  created_at: string;
  updated_at: string;
}

export interface CreateTokenData {
  asset_id?: string;
  x: number;
  y: number;
  grid_x?: number;
  grid_y?: number;
  width?: number;
  height?: number;
  name?: string;
  opacity?: number;
  properties?: any;
}

export interface UpdateTokenData {
  x?: number;
  y?: number;
  grid_x?: number;
  grid_y?: number;
  width?: number;
  height?: number;
  name?: string;
  opacity?: number;
  properties?: any;
}

export const tokensApi = {
  async getByScene(sceneId: string): Promise<ActiveToken[]> {
    return apiClient.get<ActiveToken[]>(`/api/tokens/scene/${sceneId}`);
  },

  async create(sceneId: string, data: CreateTokenData): Promise<ActiveToken> {
    return apiClient.post<ActiveToken>(`/api/tokens/scene/${sceneId}`, data);
  },

  async update(id: string, data: UpdateTokenData): Promise<ActiveToken> {
    return apiClient.put<ActiveToken>(`/api/tokens/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/tokens/${id}`);
  },
};

