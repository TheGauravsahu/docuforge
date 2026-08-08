import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../lib/api.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('docuforge_token') || null,
      isAuthenticated: Boolean(localStorage.getItem('docuforge_token')),
      isLoading: false,

      checkAuth: async () => {
        const token = localStorage.getItem('docuforge_token') || get().token;
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          return;
        }
        set({ isLoading: true });
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          localStorage.removeItem('docuforge_token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, token } = res.data;
          localStorage.setItem('docuforge_token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.response?.data?.error || 'Invalid credentials' };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', { name, email, password });
          const { user, token } = res.data;
          localStorage.setItem('docuforge_token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.response?.data?.error || 'Registration failed' };
        }
      },

      logout: () => {
        localStorage.removeItem('docuforge_token');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }),
    {
      name: 'docuforge_auth_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
