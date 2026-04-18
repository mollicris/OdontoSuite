import { httpClient } from '../../../../core/api/httpClient';
import type { LoginRequest, RegisterRequest } from '../../domain/Auth.request';
import type { LoginApiResponse, RegisterApiResponse } from '../../domain/Auth.response';
import type { AuthUser } from '../../domain/Auth.types';

export async function loginUser(req: LoginRequest): Promise<{ token: string; user: AuthUser }> {
  const res = await httpClient.post<LoginApiResponse>('/auth/login', req);
  return {
    token: res.data.data.accessToken,
    user: res.data.data.user,
  };
}

export async function registerUser(req: RegisterRequest): Promise<AuthUser> {
  const res = await httpClient.post<RegisterApiResponse>('/auth/register', req);
  return res.data.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const res = await httpClient.post<{ data: AuthUser }>('/auth/me');
  return res.data.data;
}
