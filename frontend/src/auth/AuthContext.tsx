console.log('🔥 AuthContext.tsx chargé !');

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  userRole: UserRole | null;
  getAccessToken: () => Promise<string | null>;
}

interface DecodedToken {
  userId: string;
  login_name: string;
  role: string;
  exp: number;
}

type UserRole = 'admin' | 'secretary' | 'celebrant';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configurer axios globalement
axios.defaults.withCredentials = true;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🚀 AuthProvider initialisé');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  
  // Refs pour éviter les race conditions
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);
  const tokenRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const interceptorsInstalledRef = useRef(false);

  // Fonction pour vérifier si le token est expiré
  const isTokenExpired = useCallback((token: string, bufferSeconds = 30): boolean => {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken.exp * 1000 < Date.now() + bufferSeconds * 1000;
    } catch (error) {
      return true;
    }
  }, []);

  // Programmer le rafraîchissement automatique du token
  const scheduleTokenRefresh = useCallback((exp: number) => {
    if (tokenRefreshTimeoutRef.current) {
      clearTimeout(tokenRefreshTimeoutRef.current);
    }

    const expiresIn = exp * 1000 - Date.now();
    const refreshTime = Math.max(0, expiresIn - 60000);

    console.log(`⏰ Token refresh programmé dans ${Math.round(refreshTime / 1000)}s`);

    if (refreshTime > 0) {
      tokenRefreshTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Rafraîchissement automatique du token...');
        refreshAccessToken();
      }, refreshTime);
    }
  }, []);

  // Fonction pour décoder et stocker le token
  const storeToken = useCallback((token: string) => {
    console.log('💾 Stockage du nouveau token');
    setAccessToken(token);
    const decoded = jwtDecode<DecodedToken>(token);
    setUserRole(decoded.role.toLowerCase() as UserRole);
    scheduleTokenRefresh(decoded.exp);
  }, [scheduleTokenRefresh]);

  // Fonction pour obtenir un nouveau accessToken
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (refreshPromiseRef.current) {
      console.log('⏳ Refresh déjà en cours, attente...');
      return refreshPromiseRef.current;
    }

    if (isRefreshingRef.current) {
      console.log('🛡️ Protection anti-boucle activée');
      return null;
    }

    isRefreshingRef.current = true;

    refreshPromiseRef.current = (async () => {
      try {
        console.log('🔄 Tentative de refresh du token...');
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
          {},
          { 
            withCredentials: true,
            // Ne pas utiliser l'intercepteur pour cette requête
            headers: { 'X-Skip-Interceptor': 'true' }
          }
        );
        const newAccessToken = response.data.accessToken;
        console.log('✅ Token refreshed avec succès');
        storeToken(newAccessToken);
        setIsAuthenticated(true);
        return newAccessToken;
      } catch (error: any) {
        console.error("❌ Erreur lors du rafraîchissement du token:");
        console.error("Status:", error.response?.status);
        console.error("Message:", error.response?.data);
        setIsAuthenticated(false);
        setAccessToken(null);
        setUserRole(null);
        return null;
      } finally {
        setTimeout(() => {
          refreshPromiseRef.current = null;
          isRefreshingRef.current = false;
        }, 1000);
      }
    })();

    return refreshPromiseRef.current;
  }, [storeToken]);

  // Fonction pour obtenir un accessToken valide
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (accessToken && !isTokenExpired(accessToken)) {
      return accessToken;
    }
    console.log('🔑 Token expiré ou absent, rafraîchissement...');
    return await refreshAccessToken();
  }, [accessToken, isTokenExpired, refreshAccessToken]);

  // Vérifier l'authentification au chargement
  const checkAuth = useCallback(async () => {
    try {
      console.log('🔍 Vérification de l\'authentification...');
      const token = await getAccessToken();
      if (!token) {
        console.log('⚠️ Aucun token disponible');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      console.log('✅ Token valide, utilisateur authentifié');
      setIsAuthenticated(true);
    } catch (error) {
      console.error("❌ Erreur lors de la vérification:", error);
      setIsAuthenticated(false);
      setAccessToken(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  // Déconnexion
  const logout = useCallback(async () => {
    console.log('🚪 Déconnexion...');
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("❌ Erreur de déconnexion", err);
    } finally {
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }
      setAccessToken(null);
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, []);

  // Installer les intercepteurs UNE SEULE FOIS au montage
  useEffect(() => {
    if (interceptorsInstalledRef.current) {
      console.log('⚠️ Intercepteurs déjà installés, skip');
      return;
    }

    console.log('🔌 Installation PERMANENTE des intercepteurs axios');
    interceptorsInstalledRef.current = true;
    
    const requestInterceptor = axios.interceptors.request.use(
      async (config: any) => {
        // Skip pour les routes publiques ou avec header spécial
        if (
          config.url?.includes('/auth/login') || 
          config.url?.includes('/auth/refresh-token') ||
          config.headers?.['X-Skip-Interceptor']
        ) {
          return config;
        }

        // Attendre que le token soit disponible
        let retries = 0;
        while (retries < 20) { // Augmenté à 20 tentatives (2 secondes)
          const token = await getAccessToken();
          if (token) {
            if (config.headers) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }
        
        console.warn('⚠️ Impossible d\'obtenir un token après 20 tentatives');
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest?._retry && originalRequest) {
          originalRequest._retry = true;
          console.log('⚠️ Erreur 401, tentative de refresh...');

          try {
            const newToken = await refreshAccessToken();
            
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              console.log('🔄 Retry de la requête avec nouveau token');
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('❌ Échec du refresh, déconnexion');
            setIsAuthenticated(false);
            setAccessToken(null);
            setUserRole(null);
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Ne JAMAIS nettoyer les intercepteurs
    return () => {
      console.log('⚠️ AuthProvider unmount - on garde les intercepteurs installés');
    };
  }, [getAccessToken, refreshAccessToken]);

  // Exécuter checkAuth une seule fois au montage
  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    console.log('🎬 Initialisation AuthProvider - checkAuth');
    checkAuth();
  }, [checkAuth]);

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      setIsAuthenticated,
      checkAuth,
      logout,
      loading,
      userRole, 
      getAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé (exporté séparément pour Fast Refresh)
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}