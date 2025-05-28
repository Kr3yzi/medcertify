// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // e.g., 'doctor', 'admin', etc.
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { jwt, roles, loading } = useAuth();

  // Wait for auth to load
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  // Not authenticated
  if (!jwt) {
    return <Navigate to="/signin" replace />;
  }

  // If a role is required, check it
  if (requiredRole && (!roles || !roles[requiredRole])) {
    return <div className="p-8 text-red-500">Access denied: insufficient role.</div>;
  }

  // Authenticated (and has role if required)
  return <>{children}</>;
};

export default PrivateRoute;