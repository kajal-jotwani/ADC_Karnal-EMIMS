import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthState } from "../types/auth";
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
} from "../services/auth"

//extending state with login logout actions
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  //Rehydrate user from backend when app mounts
  useEffect(() => {
    const initializedAuth = async () => {
      try{
        const user = await getCurrentUser();
        if(user){
          setAuthState({user, isAuthenticated: true, isLoading: false});
        }else{
          setAuthState({user: null, isAuthenticated: false, isLoading: false});
        }
      }catch (err) {
        console.error('Auth initialization error:', err);
        setAuthState({user: null, isAuthenticated: false, isLoading: false});
      }
    };
    initializedAuth();
  }, []);

  //Login
  const login = async (email: string, password: string): Promise<boolean> =>{
    setAuthState((prev) => ({...prev, isLoading: true}));
    try{
      const response = await apiLogin({email, password})
      const user = response.user
      if(user) {
        setAuthState({ user, isAuthenticated: true, isLoading: false });
        return true;
      }
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }catch (err){
      console.error('Login error:', err);
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  };

  //logout 
  const logout = async() => {
    setAuthState((prev) => ({...prev, isLoading: true}));
    try {
      await apiLogout();
    }catch(err) {
      console.error('Logout error:', err);
    }finally{
      setAuthState({user: null, isAuthenticated: false, isLoading: false})
    }
  }
  return (
    <AuthContext.Provider value={{...authState, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};