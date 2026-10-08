import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

/**
 * Frontend Route Protection Component
 * Checks auth state from AuthContext.
 * Redirects unauthenticated users to /login preserving intended destination.
 */
export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-[#0B2A6F] animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Checking authentication session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login while saving current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization if specified
  if (requiredRole && user?.role !== requiredRole) {
    if (requiredRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
