// Enums
export type UserRole = "admin" | "principal" | "teacher";
export type UserStatus = "active" | "inactive" | "suspended";


export interface User {
  id: number;
  email: string;
  first_name: string;          
  last_name: string;           
  contact_number?: string;     
  role: UserRole;
  status: UserStatus;
  school_id?: number;           
  school_name?: string;         
  created_at: string;           
  updated_at?: string;          
  last_login?: string;          
  is_verified: boolean;         
  is_deleted?: boolean;         
}

export interface TokenResponse {
  access_token: string;         
  refresh_token: string;       
  token_type: "bearer";
  expires_in: number;          
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: TokenResponse;
}

export interface RefreshTokenRequest {
  refresh_token: string;       
}

// Password reset flows
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;        
}

export interface ChangePasswordRequest {
  current_password: string;    
  new_password: string;       
}

// Frontend State

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}