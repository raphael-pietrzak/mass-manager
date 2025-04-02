// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token'); // Vérifie si un token existe

  // Si pas de token, redirige l'utilisateur vers /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si le token existe, affiche les enfants (page protégée)
  return <>{children}</>;
};

export default ProtectedRoute;
