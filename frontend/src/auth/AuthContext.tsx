import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  // Fonction pour obtenir un nouveau accessToken en utilisant le refreshToken
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      const newAccessToken = response.data.accessToken;
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      setIsAuthenticated(false);
      return null;
    }
  };

  // Fonction pour vérifier si le token est expiré
  const isTokenExpired = (token: string): boolean => {
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  // Fonction pour obtenir un accessToken valide
  const getAccessToken = async (): Promise<string | null> => {
    // Si on a déjà un token et qu'il n'est pas expiré, on le retourne
    if (accessToken && !isTokenExpired(accessToken)) {
      return accessToken;
    }
    
    // Sinon on demande un nouveau token
    return await refreshAccessToken();
  };

  // Création d'une instance axios avec intercepteur
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      async (config) => {
        if (!config.url?.includes('/auth/login') && !config.url?.includes('/auth/refresh-token')) {
          const token = await getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [accessToken]);

  const checkAuth = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check_login`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      console.log("Déconnexion...");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      console.log("Réponse logout :", response.data);
      setAccessToken(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Erreur de déconnexion", err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      setIsAuthenticated, 
      checkAuth, 
      logout, 
      loading,
      getAccessToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
