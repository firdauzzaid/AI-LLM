import { http } from './client';

interface AuthResponse {
  accessToken: string;
}

export const authApi = {
  signup: (email: string, password: string) =>
    http.post<AuthResponse>('/auth/signup', { email, password }),

  login: (email: string, password: string) =>
    http.post<AuthResponse>('/auth/login', { email, password }),
};
