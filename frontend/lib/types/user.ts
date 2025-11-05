export interface User {
  userId: string;
  name: string;
  email: string | null;
  createdAt: string;
}

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterRequest {
  userId: string;
  name: string;
  email?: string;
  password?: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user?: User;
}

