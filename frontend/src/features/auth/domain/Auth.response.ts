import type { AuthUser } from './Auth.types';

export interface LoginApiResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    user: AuthUser;
  };
  timestamp: string;
}

export interface RegisterApiResponse {
  statusCode: number;
  message: string;
  data: AuthUser;
  timestamp: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  errors?: string;
  timestamp: string;
}
