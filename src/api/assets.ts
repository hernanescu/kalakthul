import { apiClient } from './client';

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
  created_at: string;
  last_used: string;
}

export const assetsApi = {
  async upload(file: File, type: 'map' | 'token', folderId?: string, name?: string): Promise<Asset> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    if (folderId) formData.append('folderId', folderId);
    if (name) formData.append('name', name);

    const asset = await apiClient.upload<Asset>('/api/assets/upload', formData);
    return asset;
  },

  async getAll(type?: 'map' | 'token', folderId?: string, page?: number, limit?: number): Promise<Asset[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (folderId) params.append('folderId', folderId);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const query = params.toString();
    return apiClient.get<Asset[]>(`/api/assets${query ? `?${query}` : ''}`);
  },

  async getById(id: string): Promise<Asset> {
    return apiClient.get<Asset>(`/api/assets/${id}`);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/assets/${id}`);
  },
};

