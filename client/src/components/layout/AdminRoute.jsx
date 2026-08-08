import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useAuthStore.js';
import { PageLoader } from '../ui/ErrorBoundary.jsx';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader label="Verifying Admin Permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role !== 'ADMIN') {
    toast.error('Access Denied: Admin privileges required');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
