import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Config from 'react-native-config';
import { API_URLS } from '../urls';
import { supabase } from '../../lib/supabase';
import { Strings } from '../../constants/strings';

interface HttpError {
  code: string;
  message: string;
  errorData?: Record<string, unknown>;
}

class HttpService {
  private static instance: HttpService;

  private constructor() {}

  static getInstance(): HttpService {
    if (!HttpService.instance) {
      HttpService.instance = new HttpService();
    }
    return HttpService.instance;
  }

  private getClient(): AxiosInstance {
    const client = axios.create({
      baseURL: API_URLS.BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        apikey: Config.SUPABASE_ANON_KEY || '',
      },
    });

    client.interceptors.request.use(async config => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      return config;
    });

    client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async error => {
        const status = error.response?.status;
        const body = error.response?.data;

        if (status === 401) {
          return Promise.reject({
            code: 'Unauthorized',
            message: Strings.SESSION_EXPIRED,
            errorData: body,
          } as HttpError);
        }
        if (status === 400 || status === 409) {
          return Promise.reject({
            code: String(status),
            message: body?.message || body?.error || `Request failed (${status})`,
            errorData: body,
          } as HttpError);
        }
        if (!error.response) {
          return Promise.reject({
            code: 'NetworkError',
            message: Strings.NETWORK_ERROR,
          } as HttpError);
        }
        return Promise.reject(error);
      },
    );

    return client;
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<AxiosResponse<T>> {
    const client = this.getClient();
    return client.get<T>(url, { params });
  }

  async post<T>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    const client = this.getClient();
    return client.post<T>(url, data, {
      headers: { 'Prefer': 'return=representation' },
    });
  }

  async put<T>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    const client = this.getClient();
    // Use PATCH for Supabase partial updates (PUT causes pgrst_body errors)
    return client.patch<T>(url, data, {
      headers: { 'Prefer': 'return=representation' },
    });
  }

  async delete<T>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    const client = this.getClient();
    return client.delete<T>(url, { data });
  }
}

export const httpService = HttpService.getInstance();
