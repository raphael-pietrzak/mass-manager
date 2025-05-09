// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: ('admin' | 'secretary' | 'celebrant')[]; // Liste des rôles autorisés
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const auth = useAuth();

  if (auth.loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!requiredRole || !auth.userRole || !requiredRole.includes(auth.userRole)) {
    return <div className="flex justify-center items-center h-screen">Accès refusé</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;