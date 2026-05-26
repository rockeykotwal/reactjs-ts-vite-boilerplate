import { create } from 'zustand';
import type { AuthState, User } from '../types/auth.types';

interface AuthStore extends AuthState {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: Boolean(localStorage.getItem('accessToken')),
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  setToken: (token) => {
    localStorage.setItem('accessToken', token);
    set({ accessToken: token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
