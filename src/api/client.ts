import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { useAuthStore } from '../store/auth.store';
import { ENDPOINTS } from './endpoints';

const client = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

// --- silent refresh state ---

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token as string);
    }
  });
  failedQueue = [];
}

// --- request interceptor ---

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- response interceptor ---

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Queue subsequent 401s while a refresh is already in-flight.
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{ data: { accessToken: string } }>(
        `${env.apiUrl}${ENDPOINTS.AUTH.REFRESH}`,
        {},
        { withCredentials: true }
      );

      const newToken = data.data.accessToken;
      localStorage.setItem('accessToken', newToken);
      useAuthStore.getState().setToken(newToken);

      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return client(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
