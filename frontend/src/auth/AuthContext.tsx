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

type UserRole = 'admin' | 'secretary' | 'celebrant';
interface DecodedToken { exp: number; role: string; }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Vérifie si token expiré (avec buffer de 30s)
  const isTokenExpired = useCallback((token: string, bufferSeconds = 30) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 < Date.now() + bufferSeconds * 1000;
    } catch {
      return true;
    }
  }, []);

  // Rafraîchit l'accessToken
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      const newToken = response.data.accessToken;
      setAccessToken(newToken);

      const decoded: DecodedToken = jwtDecode(newToken);
      setUserRole(decoded.role.toLowerCase() as UserRole);
      setIsAuthenticated(true);

      // Planifie prochain refresh
      scheduleRefresh(newToken);

      return newToken;
    } catch (err) {
      console.error("Erreur lors du refresh token:", err);
      setIsAuthenticated(false);
      setAccessToken(null);
      setUserRole(null);
      return null;
    }
  }, []);

  // Planifie le rafraîchissement automatique
  const scheduleRefresh = useCallback((token: string) => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);

    const decoded: DecodedToken = jwtDecode(token);
    const expiresIn = decoded.exp * 1000 - Date.now();
    const refreshTime = Math.max(0, expiresIn - 30000); // rafraîchir 30s avant

    refreshTimeoutRef.current = setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);
  }, [refreshAccessToken]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (accessToken && !isTokenExpired(accessToken)) return accessToken;
    return await refreshAccessToken();
  }, [accessToken, isTokenExpired, refreshAccessToken]);

  // Axios interceptor pour ajouter accessToken
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(async (config) => {
      if (
        !config.url?.includes("/auth/login") &&
        !config.url?.includes("/auth/refresh-token")
      ) {
        const token = await getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    return () => axios.interceptors.request.eject(interceptor);
  }, [getAccessToken]);

  // Vérifie l'auth au montage
  const checkAuth = useCallback(async () => {
    try {
      // Toujours tenter de récupérer un accessToken (refresh si nécessaire)
      const token = await refreshAccessToken(); // <-- ici
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Token valide, on peut vérifier la session côté backend
      await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check_login`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [refreshAccessToken]);


  useEffect(() => { checkAuth(); }, [checkAuth]);

  // Déconnexion
  const logout = useCallback(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error(err);
    } finally {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      setAccessToken(null);
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated, setIsAuthenticated, checkAuth, logout, loading, userRole, getAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};