import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  university?: any;
  skills?: string[];
  bio?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // initial state before check

      login: (userData, token) => {
        set({ user: userData, token, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      fetchUser: async () => {
        const { token } = get();
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          set({ isLoading: true });
          const res = await api.get('/auth/me');
          set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'acadrepo-auth', // name of the item in the storage (must be unique)
      partialize: (state) => ({ token: state.token }), // only save token to local storage
    }
  )
);
