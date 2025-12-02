import { createContext, useContext, useState, useEffect } from 'react';
import sampleUsers from '../data/sampleUsers.json';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem('printease_currentUser');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } else {
          setUser({ role: 'guest' });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser({ role: 'guest' });
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} { success: boolean, user?: Object, error?: string }
   */
  const login = (email, password) => {
    // Find user in sample users
    const foundUser = sampleUsers.users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      // Create user object without password
      const { password: _, ...userData } = foundUser;
      const userObj = {
        ...userData,
        token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      setUser(userObj);
      localStorage.setItem('printease_currentUser', JSON.stringify(userObj));
      localStorage.setItem('printease_token', userObj.token);
      
      return { success: true, user: userObj };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  /**
   * Logout user
   */
  const logout = () => {
    setUser({ role: 'guest' });
    localStorage.removeItem('printease_currentUser');
    localStorage.removeItem('printease_token');
  };

  /**
   * Check if user has required role
   * @param {string|Array} requiredRoles - Required role(s)
   * @returns {boolean}
   */
  const hasRole = (requiredRoles) => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(user.role);
  };

  /**
   * Check if user is authenticated (not guest)
   * @returns {boolean}
   */
  const isAuthenticated = () => {
    return user && user.role !== 'guest';
  };

  /**
   * Get current user role
   * @returns {string}
   */
  const getRole = () => {
    return user?.role || 'guest';
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    hasRole,
    isAuthenticated,
    getRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;

