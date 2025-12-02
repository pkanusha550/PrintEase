import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute - RBAC check for protected routes
 * 
 * Supports role-based access control with:
 * - 'guest': No authentication required
 * - 'customer': Authenticated customer
 * - 'dealer': Authenticated dealer
 * - 'admin': Authenticated admin
 * 
 * Can accept single role or array of roles
 */
export default function ProtectedRoute({ 
  children, 
  requiredRole = null,
  requiredRoles = null 
}) {
  const { user, isLoading, hasRole, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Determine required roles
  const roles = requiredRoles || (requiredRole ? [requiredRole] : null);

  // If no role specified, allow authenticated users
  if (!roles) {
    if (!isAuthenticated()) {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
    return children;
  }

  // Check if user has required role
  const isAuthorized = hasRole(roles);

  if (!isAuthorized) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

