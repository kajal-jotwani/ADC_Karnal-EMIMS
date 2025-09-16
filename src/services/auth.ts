// services/auth.ts
import axios from "axios";
import {
  User,
  UserRole,
  LoginCredentials,
  LoginResponse,
  TokenResponse,
} from "../types/auth";

// ✅ Use env var in dev/prod
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ✅ Axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service 

export const login = async (
    Credentials: LoginCredentials
): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", Credentials);

localStorage.setItem("access_token", DataTransfer.tokens.access_token)
localStorage.setItem("refersh_token", DataTransfer.tokens.refersh_token)
localStorage.setItem("auth_token", DataTransfer.tokens.auth_token)

return data;
};

export const refershAccessToken = async():
Promise<TokenResponse | null> =>{
    const refreshToken = localStorage.getItem("refresh_token");
    if(!refreshToken) return null;

    try{
        const {data} = await api.post<TokenResponse>("/auth/refresh",{
            refresh_token: refreshToken,
        });

        localStorage.setItem("access_token", data.accessToken);
        localStorage.setItem("refresh_token", data.refreshToken);

        return data;
    }catch {
        clearAuth();
        return null;
    }
};

export const logout = async():
Promise<void> =>{
    const refreshToken = localStorage.getItem("refresh_token");

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
            const newTokens = await refershAccessToken();
            if(newTokens){
                const {data: retryData} = await api.get<User>("/auth/me", {
                    headers:{
                        Authorization: `Bearer ${newTokens.accessToken}`,
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
        const token = localStorage.getItem("access_token");
        const userData = localStorage.getItem("auth_user");

        if(token && userData){
            return {token, user : JSON.parse(userData) as User};
        }
    }catch(err){
        console.error("Error reading stored auth:", err);
    }
    return {user: null, token: null};
};

export const clearAuth = (): void =>{
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
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