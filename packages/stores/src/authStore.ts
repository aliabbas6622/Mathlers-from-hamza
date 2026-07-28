import { create } from 'zustand';

type Session = { user: { id: string; email?: string; name?: string; role?: string } };

interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  setSession: (session) => set({ session, isAuthenticated: !!session }),
  clearSession: () => set({ session: null, isAuthenticated: false }),
}));
