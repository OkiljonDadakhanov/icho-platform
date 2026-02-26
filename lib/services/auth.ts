/**
 * Authentication Service
 * Handles login, logout, and token management
 */

import { api } from '../api';
import type { LoginRequest, LoginResponse, User } from '../types';

export const authService = {
  /**
   * Login with country name and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login/', credentials);
    api.setTokens(response.access, response.refresh);
    return response;
  },

  /**
   * Logout - blacklist refresh token on server and clear local tokens
   */
  async logout(): Promise<void> {
    await api.logout();
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me/');
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return api.post<{ access: string }>('/auth/refresh/', { refresh: refreshToken });
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return api.isAuthenticated();
  },

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return api.getAccessToken();
  },
};

export default authService;
