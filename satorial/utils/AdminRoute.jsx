import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import PageLoader from '../src/components/loaders/PageLoader';

const ALLOWED_ROLES = ['super_admin', 'admin', 'organization'];

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!ALLOWED_ROLES.includes(user.role?.toLowerCase())) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
