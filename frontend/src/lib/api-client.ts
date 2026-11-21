/**
 * Host Pilot — Centralized API Client
 * Supports environment-based base URL, credentials/cookies, Bearer tokens,
 * standardized error envelopes, and typed response payloads.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export class ApiError extends Error {
  public code: string;
  public status: number;
  public details?: ApiErrorDetail[];

  constructor(message: string, code = 'ERROR', status = 500, details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const TOKEN_STORAGE_KEY = 'hp_auth_token';

class ApiClient {
  private inMemoryToken: string | null = null;

  public setToken(token: string | null): void {
    this.inMemoryToken = token;
  }

  public getToken(): string | null {
    return this.inMemoryToken;
  }

  private getAuthHeader(): Record<string, string> {
    if (this.inMemoryToken) {
      return { Authorization: `Bearer ${this.inMemoryToken}` };
    }
    return {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Sends HttpOnly auth cookie if set
    });

    let json: any = {};
    try {
      json = await response.json();
    } catch {
      // Non-JSON response
    }

    if (!response.ok || json.success === false) {
      const code = json.error?.code || `HTTP_${response.status}`;
      const isEn = typeof window !== 'undefined' && window.localStorage?.getItem('i18nextLng')?.startsWith('en');
      const fallbackMsg = isEn ? 'An unexpected error occurred' : 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে';
      const message =
        json.error?.message || response.statusText || fallbackMsg;
      const details = json.error?.details;

      // Handle 401 Unauthorized globally: clear stale in-memory token
      if (response.status === 401) {
        this.inMemoryToken = null;
      }

      throw new ApiError(message, code, response.status, details);
    }

    return json as ApiResponse<T>;
  }

  public get<T>(endpoint: string, query?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (query) {
      const filteredParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          filteredParams.append(key, String(value));
        }
      });
      const queryString = filteredParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  public post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(urlWithSlash(endpoint), {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(urlWithSlash(endpoint), {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(urlWithSlash(endpoint), {
      method: 'DELETE',
    });
  }
}

function urlWithSlash(endpoint: string): string {
  return endpoint;
}

export const apiClient = new ApiClient();
