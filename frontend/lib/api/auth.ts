import { post } from './client';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  VerifyTokenRequest,
  VerifyTokenResponse
} from '../types/user';

/**
 * Login user and get JWT token
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await post<LoginResponse>('/auth/login', credentials);
  return response;
};

/**
 * Register a new user
 */
export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const response = await post<RegisterResponse>('/user', userData);
  return response;
};

/**
 * Verify JWT token validity
 */
export const verifyToken = async (token: string): Promise<VerifyTokenResponse> => {
  const response = await post<VerifyTokenResponse>('/auth/verify', { token });
  return response;
};

/**
 * Logout (client-side only, clears cookies)
 */
export const logout = (): void => {
  // Cookies will be cleared by the auth store
};

