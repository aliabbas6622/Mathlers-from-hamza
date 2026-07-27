import { api } from './api';
import { Session } from 'next-auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  user: Session['user'];
}

export const authService = {
  login: async (credentials: LoginRequest) => {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  register: async (data: RegisterRequest) => {
    return api.post<AuthResponse>('/auth/register', data);
  },

  logout: async () => {
    // Client-side logout is handled by next-auth signOut
    return { data: { success: true }, status: 200 };
  },

  getSession: async () => {
    // Session is managed by next-auth client
    return { data: null as Session | null, status: 200 };
  },

  getProfile: async () => {
    return api.get<AuthResponse>('/user/profile');
  },

  updateProfile: async (data: Partial<RegisterRequest>) => {
    return api.put<AuthResponse>('/user/profile', data);
  },
};
