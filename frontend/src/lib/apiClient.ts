// Prism API Client
// Standard Fetch Wrapper with JWT interceptors & typed responses

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('prism_auth_token');
  }

  public setToken(token: string) {
    localStorage.setItem('prism_auth_token', token);
  }

  public clearToken() {
    localStorage.removeItem('prism_auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const rootToken = typeof window !== 'undefined' ? sessionStorage.getItem('prism_root_token') : null;
    const token = (endpoint.includes('/superadmin') && rootToken) ? rootToken : this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired or unauthorized
        this.clearToken();
      }

      const contentType = response.headers.get('content-type') || '';
      let data: ApiResponse<T>;

      if (contentType.includes('application/json')) {
        const text = await response.text();
        try {
          data = text ? JSON.parse(text) : { success: response.ok };
        } catch {
          data = { success: false, error: 'Malformed JSON server response' };
        }
      } else {
        const text = await response.text();
        data = { success: response.ok, error: text || `HTTP ${response.status}: ${response.statusText}` };
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP Error ${response.status}: ${response.statusText}`);
      }

      return (data.data !== undefined ? data.data : data) as T;
    } catch (error: any) {
      console.warn(`[API Client] ${options.method || 'GET'} ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  public get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;
