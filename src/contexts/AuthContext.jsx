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
   * Login user with OTP (no password required)
   * @param {string} email - User email
   * @param {Object} userData - User data from OTP session
   * @returns {Object} { success: boolean, user?: Object, error?: string }
   */
  const loginWithOTP = (email, userData) => {
    // Find user in sample users
    const foundUser = sampleUsers.users.find(
      (u) => u.email === email && u.role === userData.role
    );

    if (foundUser) {
      // Create user object without password
      const { password: _, ...userDataClean } = foundUser;
      const userObj = {
        ...userDataClean,
        token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      setUser(userObj);
      localStorage.setItem('printease_currentUser', JSON.stringify(userObj));
      localStorage.setItem('printease_token', userObj.token);
      
      return { success: true, user: userObj };
    }

    return { success: false, error: 'Invalid user data' };
  };

  /**
   * Logout user - clears all user-related localStorage
   */
  const logout = () => {
    setUser({ role: 'guest' });
    // Clear all authentication-related localStorage items
    localStorage.removeItem('printease_currentUser');
    localStorage.removeItem('printease_token');
    // Note: We keep printease_orders, printease_otp_session, etc. for demo purposes
    // In production, you might want to clear these too or handle them differently
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
    loginWithOTP,
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

