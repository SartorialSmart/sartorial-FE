import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import PageLoader from '../src/components/loaders/PageLoader';
import { isAdminRole, canViewModule, canPerformAction, canPerformAny } from '../src/utils/permissions';

/**
 * Permission-gated route. Admins always pass. Staff must hold the required
 * permission, otherwise they are redirected to /dashboard (not to login —
 * they are authenticated, just not authorized for this module/action).
 *
 * Usage:
 *   <PermissionRoute module="inventory" action="view">...</PermissionRoute>
 *   <PermissionRoute module="orders" anyActions={["create","edit"]}>...</PermissionRoute>
 *   <PermissionRoute module="staff" requireView>...</PermissionRoute> -> checks canView
 */
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

  // Admins bypass all permission checks
  if (isAdminRole(user.role)) return children;

  let allowed = false;
  if (requireView) {
    allowed = canViewModule(user, module);
  } else if (Array.isArray(anyActions) && anyActions.length) {
    allowed = canPerformAny(user, module, anyActions);
  } else if (module && action) {
    allowed = canPerformAction(user, module, action);
  } else if (module) {
    allowed = canViewModule(user, module);
  }

  if (!allowed) return <Navigate to="/dashboard" replace />;

  return children;
};

export default PermissionRoute;
