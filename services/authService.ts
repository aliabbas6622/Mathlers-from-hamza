import { api } from './api';

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
  user: { id: string; email?: string; name?: string; role?: string };
}

export const authService = {
  login: async (credentials: LoginRequest) => {
    void credentials;
    throw new Error('Use Clerk sign-in for authentication.');
  },

  register: async (data: RegisterRequest) => {
    void data;
    throw new Error('Use Clerk sign-up for registration.');
  },

  logout: async () => {
    // Clerk's UserButton handles sign-out in the interface.
    return { data: { success: true }, status: 200 };
  },

  getSession: async () => {
    return { data: null, status: 200 };
  },

  getProfile: async () => {
    return api.get<AuthResponse>('/user/profile');
  },

  updateProfile: async (data: Partial<RegisterRequest>) => {
    return api.put<AuthResponse>('/user/profile', data);
  },
};
