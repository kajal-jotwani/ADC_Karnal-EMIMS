// services/auth.ts
import axios from "axios";
import {
  User,
  UserRole,
  LoginCredentials,
  LoginResponse,
  TokenResponse,
} from "../types/auth";
import { string } from "zod";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service 

export const login = async (
    credentials: LoginCredentials
): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", credentials);

    const accessToken = data.tokens.access_token;
    const refreshToken = data.tokens.refresh_token;

    if (!accessToken || !refreshToken) {
        console.error("Tokens not found in response!");
        throw new Error("Invalid login response - tokens not found");
    }

    sessionStorage.setItem("access_token", accessToken);
    sessionStorage.setItem("refresh_token", refreshToken);
    sessionStorage.setItem("auth_user", JSON.stringify(data.user));

    return data;
};

export const refreshAccessToken = async():
Promise<TokenResponse | null> =>{
    const refreshToken = sessionStorage.getItem("refresh_token");
    if(!refreshToken) return null;

    try{
        const {data} = await api.post<TokenResponse>("/auth/refresh",{
            refresh_token: refreshToken,
        });

        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;

        if (!newAccessToken || !newRefreshToken) {
            throw new Error("Invalid token refresh response");
        }

        sessionStorage.setItem("access_token", newAccessToken);
        sessionStorage.setItem("refresh_token", newRefreshToken);

        return data;
    }catch (error) {
        console.error("Token refresh failed:", error);
        clearAuth();
        return null;
    }
};

export const logout = async():
Promise<void> =>{
    const refreshToken = sessionStorage.getItem("refresh_token");

    try{
        if(refreshToken){
            await api.post("/auth/logout", {refresh_token: refreshToken});
        }
    }catch (err){
        console.error("Logout error: ", err);
    }finally{
        clearAuth();
    }
};

export const getCurrentUser = async():
Promise<User | null> =>{
    try{
        const {data} = await api.get<User>("/auth/me");
        return data;
    }catch (error: any){
        if(error.response?.status === 401){
            const newTokens = await refreshAccessToken();
            if(newTokens){
                const {data: retryData} = await api.get<User>("/auth/me", {
                    headers:{
                        Authorization: `Bearer ${newTokens.access_token}`,
                    },
                });
                return retryData;
            }
        }
        return null;
    }
};

// Helper functions for local storage
export const getStoredAuth = (): {user: User | null; token: string | null} =>{
    try{
        const token = sessionStorage.getItem("access_token");
        const userData = sessionStorage.getItem("auth_user");

        if(token && userData){
            return {token, user : JSON.parse(userData) as User};
        }
    }catch(err){
        console.error("Error reading stored auth:", err);
    }
    return {user: null, token: null};
};

export const clearAuth = (): void =>{
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("auth_user");
};

//Permission Helpers

export const hasPermission = (
    userRole: UserRole,
    requiredRoles: UserRole[]
): boolean => {
    return requiredRoles.includes(userRole);
};

export const getRoutePermissions = (path: string): UserRole[] => {
  const routePermissions: Record<string, UserRole[]> = {
    "/": ["admin", "principal", "teacher"],
    "/schools": ["admin"],
    "/teachers": ["admin", "principal"],
    "/students": ["admin", "principal", "teacher"],
    "/subjects": ["admin"],
    "/reports": ["admin", "principal"],
    "/data": ["admin"],
    "/analytics": ["admin", "principal"],
    "/settings": ["admin", "principal", "teacher"],
    "/class-management": ["principal"],
    "/teacher-dashboard": ["teacher"],
    "/daily-attendance": ["teacher"],
    "/exam-marks": ["teacher"],
  };

  return routePermissions[path] || [];
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{
  success: any; message: string 
}> => {
  try {
    const { data } = await api.post<{ success: any; message: string }>("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return data;
  } catch (error: any) {
    console.error("Password change failed:", error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Unable to change password. Please try again later.");
  }
};