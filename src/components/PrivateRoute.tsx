import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string; // Optional override
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole, redirectTo }) => {
  const { jwt, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!jwt) {
    return <Navigate to={redirectTo || "/signin"} replace />;
  }

  if (requiredRole && (!roles || !roles[requiredRole])) {
    return <Navigate to={redirectTo || "/unauthorized"} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
