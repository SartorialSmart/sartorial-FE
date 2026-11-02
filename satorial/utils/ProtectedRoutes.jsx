import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import PageLoader from '../src/components/loaders/PageLoader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    // Remember where the user was so login can return them here — whether they
    // logged out deliberately or their session simply expired. Persisted to
    // localStorage so it survives the redirect, a full reload, or a new tab.
    const from = `${location.pathname}${location.search}`;
    if (from && from !== '/login') {
      try {
        localStorage.setItem('postLoginRedirect', from);
      } catch {
        /* ignore storage errors (private mode, quota) */
      }
    }
    return <Navigate to="/login" state={{ from }} replace />;
  }

  return children;
};

export default ProtectedRoute;
