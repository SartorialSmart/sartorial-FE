import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageLoader from '../components/loaders/PageLoader';
import { isAdminRole, canViewModule, canPerformAction, canPerformAny } from './permissions';

const PermissionRoute = ({ children, module, action, anyActions, requireView = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    const from = `${location.pathname}${location.search}`;
    if (from && from !== '/login') {
      try { localStorage.setItem('postLoginRedirect', from); } catch { /* ignore */ }
    }
    return <Navigate to="/login" state={{ from }} replace />;
  }

  if (isAdminRole(user.role)) return children;

  let allowed = false;
  if (requireView) allowed = canViewModule(user, module);
  else if (Array.isArray(anyActions) && anyActions.length) allowed = canPerformAny(user, module, anyActions);
  else if (module && action) allowed = canPerformAction(user, module, action);
  else if (module) allowed = canViewModule(user, module);

  if (!allowed) return <Navigate to="/dashboard" replace />;

  return children;
};

export default PermissionRoute;
