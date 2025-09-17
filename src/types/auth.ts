// Enums
export type UserRole = "admin" | "principal" | "teacher";
export type UserStatus = "active" | "inactive" | "suspended";

// User-related Types

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  contactNumber?: string;
  role: UserRole;
  status: UserStatus;
  schoolId?: number;
  schoolName?: string;
  createdAt: string; // ISO datetime
  updatedAt?: string; // optional for responses
  lastLogin?: string;
  isVerified: boolean;
  isDeleted?: boolean; // included for admin-only contexts
}

// Tokens

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "bearer";
  expiresIn: number; // in seconds
}

// API DTOs

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: TokenResponse;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Password reset flows
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Frontend State

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
