import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import * as authApi from '../api/auth';
import type { User, LoginRequest, RegisterRequest } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login(credentials);
          
          // Store token in cookies (httpOnly would be better in production)
          Cookies.set('auth_token', response.token, { 
            expires: 7, // 7 days
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          });
          Cookies.set('user_id', response.user.userId, { 
            expires: 7,
            path: '/',
            sameSite: 'lax' 
          });
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || error.message || 'Login failed';
          set({ 
            isLoading: false, 
            error: errorMessage,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      // Register action
      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          await authApi.register(userData);
          
          set({
            isLoading: false,
            error: null
          });
          
          // After successful registration, user needs to login
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          throw error;
        }
      },

      // Logout action
      logout: () => {
        Cookies.remove('auth_token');
        Cookies.remove('user_id');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      // Verify token action
      verifyToken: async () => {
        const token = Cookies.get('auth_token');
        
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return false;
        }
        
        try {
          const response = await authApi.verifyToken(token);
          
          if (response.valid && response.user) {
            set({
              user: response.user,
              token,
              isAuthenticated: true,
              error: null
            });
            return true;
          } else {
            // Invalid token, clear auth
            get().logout();
            return false;
          }
        } catch (error) {
          // Token verification failed
          get().logout();
          return false;
        }
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

