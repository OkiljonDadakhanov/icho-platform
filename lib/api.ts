/**
 * API Client for IChO 2026 Backend
 * Handles all HTTP requests with JWT authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn('NEXT_PUBLIC_API_URL is not set. Using default: http://localhost:8000/api');
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private static instance: ApiClient;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      // Also set cookies for middleware to access
      // Use Secure in production (HTTPS), SameSite=Lax for CSRF protection
      const isSecure = window.location.protocol === 'https:';
      const secureFlag = isSecure ? '; Secure' : '';
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 30}; SameSite=Lax${secureFlag}`; // 30 minutes
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`; // 7 days
    }
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Also clear cookies with same attributes for proper cleanup
      const isSecure = window.location.protocol === 'https:';
      const secureFlag = isSecure ? '; Secure' : '';
      document.cookie = `accessToken=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
      document.cookie = `refreshToken=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      try {
        // Blacklist the refresh token on the server
        await fetch(`${API_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({ refresh: this.refreshToken }),
        });
      } catch {
        // Ignore errors - we'll clear tokens locally regardless
      }
    }
    this.clearTokens();
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access, data.refresh || this.refreshToken);
        return true;
      }
      this.clearTokens();
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!API_URL) {
      throw new Error('API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response: Response;
    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'include',
      });
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw {
          message: 'Unable to connect to the server. Please check your internet connection and ensure the API server is running.',
          status: 0,
        } as ApiError;
      }
      throw error;
    }

    // Handle token refresh
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
        try {
          response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            mode: 'cors',
            credentials: 'include',
          });
        } catch (error) {
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw {
              message: 'Unable to connect to the server. Please check your internet connection and ensure the API server is running.',
              status: 0,
            } as ApiError;
          }
          throw error;
        }
      }
    }

    if (!response.ok) {
      const error: ApiError = {
        message: 'An error occurred',
        status: response.status,
      };

      try {
        const data = await response.json();
        // Handle various error formats from DRF
        if (data.detail) {
          error.message = data.detail;
        } else if (data.message) {
          error.message = data.message;
        } else if (typeof data === 'object') {
          // Handle field-specific errors like {'role': 'error message'}
          const fieldErrors = Object.entries(data)
            .map(([key, value]) => {
              const msg = Array.isArray(value) ? value.join(', ') : String(value);
              return msg;
            })
            .filter(Boolean);
          if (fieldErrors.length > 0) {
            error.message = fieldErrors.join('. ');
          }
        }
        error.errors = data.errors || data;
      } catch {
        // ignore json parse error
      }

      throw error;
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) return {} as T;

    return JSON.parse(text);
  }

  private async requestWithFile<T>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST'
  ): Promise<T> {
    if (!API_URL) {
      throw new Error('API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
    }

    const headers: HeadersInit = {};

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response: Response;
    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: formData,
        mode: 'cors',
        credentials: 'include',
      });
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw {
          message: 'Unable to connect to the server. Please check your internet connection and ensure the API server is running.',
          status: 0,
        } as ApiError;
      }
      throw error;
    }

    // Handle token refresh
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        try {
          response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: formData,
            mode: 'cors',
            credentials: 'include',
          });
        } catch (error) {
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw {
              message: 'Unable to connect to the server. Please check your internet connection and ensure the API server is running.',
              status: 0,
            } as ApiError;
          }
          throw error;
        }
      }
    }

    if (!response.ok) {
      const error: ApiError = {
        message: 'An error occurred',
        status: response.status,
      };

      try {
        const data = await response.json();
        // Handle various error formats from DRF
        if (data.detail) {
          error.message = data.detail;
        } else if (data.message) {
          error.message = data.message;
        } else if (typeof data === 'object') {
          // Handle field-specific errors like {'role': 'error message'}
          const fieldErrors = Object.entries(data)
            .map(([key, value]) => {
              const msg = Array.isArray(value) ? value.join(', ') : String(value);
              return msg;
            })
            .filter(Boolean);
          if (fieldErrors.length > 0) {
            error.message = fieldErrors.join('. ');
          }
        }
        error.errors = data.errors || data;
      } catch {
        // ignore json parse error
      }

      throw error;
    }

    const text = await response.text();
    if (!text) return {} as T;

    return JSON.parse(text);
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload (POST)
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.requestWithFile<T>(endpoint, formData, 'POST');
  }

  // File upload (PATCH)
  async uploadPatch<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.requestWithFile<T>(endpoint, formData, 'PATCH');
  }

  // Download file
  async download(endpoint: string): Promise<Blob> {
    if (!API_URL) {
      throw new Error('API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
    }

    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response: Response;
    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers,
        mode: 'cors',
        credentials: 'include',
      });
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection and ensure the API server is running.');
      }
      throw error;
    }

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  }

  // Download file and open in new tab (secure - no token in URL)
  async downloadAndOpen(endpoint: string): Promise<void> {
    const blob = await this.download(endpoint);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Clean up blob URL after a delay to allow the new tab to load
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}

// Export singleton instance
export const api = ApiClient.getInstance();

// Export convenience functions
export const apiGet = <T>(endpoint: string) => api.get<T>(endpoint);
export const apiPost = <T>(endpoint: string, data?: unknown) => api.post<T>(endpoint, data);
export const apiPut = <T>(endpoint: string, data: unknown) => api.put<T>(endpoint, data);
export const apiPatch = <T>(endpoint: string, data: unknown) => api.patch<T>(endpoint, data);
export const apiDelete = <T>(endpoint: string) => api.delete<T>(endpoint);
export const apiUpload = <T>(endpoint: string, formData: FormData) => api.upload<T>(endpoint, formData);
export const apiDownload = (endpoint: string) => api.download(endpoint);
export const apiDownloadAndOpen = (endpoint: string) => api.downloadAndOpen(endpoint);
export const apiLogout = () => api.logout();
