import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  subscription_tier: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  async register(email: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', { email });
    apiClient.setToken(response.token);
    return response;
  },

  async login(email: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', { email });
    apiClient.setToken(response.token);
    return response;
  },

  logout() {
    apiClient.setToken(null);
  },

  getToken(): string | null {
    return apiClient['token'];
  },
};

