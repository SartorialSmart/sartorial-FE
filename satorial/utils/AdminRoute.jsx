import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import PageLoader from '../src/components/loaders/PageLoader';
import { isAdminRole } from '../src/utils/permissions';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    // Same as ProtectedRoute: remember the page so login can return here.
    const from = `${location.pathname}${location.search}`;
    if (from && from !== '/login') {
      try {
        localStorage.setItem('postLoginRedirect', from);
      } catch {
        /* ignore storage errors */
      }
    }
    return <Navigate to="/login" state={{ from }} replace />;
  }

  if (!isAdminRole(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
