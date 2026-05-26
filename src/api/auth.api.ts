import client from './client';
import { ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../types/api.types';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthTokens {
  accessToken: string;
}

export const loginUser = (
  email: string,
  password: string
): Promise<ApiResponse<AuthTokens>> =>
  client
    .post<ApiResponse<AuthTokens>>(ENDPOINTS.AUTH.LOGIN, { email, password })
    .then((r) => r.data);

export const registerUser = (
  name: string,
  email: string,
  password: string
): Promise<ApiResponse<User>> =>
  client
    .post<ApiResponse<User>>(ENDPOINTS.AUTH.REGISTER, { name, email, password })
    .then((r) => r.data);

export const logoutUser = (): Promise<ApiResponse<null>> =>
  client.post<ApiResponse<null>>(ENDPOINTS.AUTH.LOGOUT).then((r) => r.data);

export const getMe = (): Promise<ApiResponse<User>> =>
  client.get<ApiResponse<User>>(ENDPOINTS.AUTH.ME).then((r) => r.data);
