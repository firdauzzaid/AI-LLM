import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,

      setToken: (token) => {
        localStorage.setItem('access_token', token);
        set({ token });
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({ token: null });
      },

      isAuthenticated: () => get().token !== null,
    }),
    {
      name: 'auth',
      // Only persist the token field
      partialize: (state) => ({ token: state.token }),
    },
  ),
);
