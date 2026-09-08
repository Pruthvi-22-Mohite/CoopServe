import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../common/LoadingState';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState fullScreen message="Authenticating CoopServe session..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const defaultRoute =
      user.role === 'SERVICE_PROVIDER'
        ? '/provider/dashboard'
        : user.role === 'ADMIN'
        ? '/admin/dashboard'
        : '/customer/dashboard';

    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};
