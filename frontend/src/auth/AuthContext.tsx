import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check_login`, { withCredentials: true });
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
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Erreur de déconnexion", err);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, checkAuth, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
