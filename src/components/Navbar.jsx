import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'New Order', to: '/order' },
  { label: 'My Orders', to: '/my-orders' },
  { label: 'Contact', to: '/#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = hasRole('admin');
  const isDealer = hasRole('dealer');
  const isCustomer = hasRole('customer');
  const isAuthenticated = user && user.role && user.role !== 'guest';

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    // Redirect to home or login page
    navigate('/', { replace: true });
  };

  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    const names = user.name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const renderLink = (link) =>
    link.to.startsWith('/#') ? (
      <a
        key={link.to}
        href={link.to.replace('/', '')}
        className="text-secondary-dark hover:text-primary transition-colors duration-smooth font-medium"
        onClick={() => setIsOpen(false)}
      >
        {link.label}
      </a>
    ) : (
      <NavLink
        key={link.to}
        to={link.to}
        end
        className={({ isActive }) =>
          `text-secondary-dark hover:text-primary transition-colors duration-smooth font-medium ${
            isActive ? 'text-primary border-b-2 border-primary' : ''
          }`
        }
        onClick={() => setIsOpen(false)}
      >
        {link.label}
      </NavLink>
    );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-smooth ${
        isScrolled
          ? 'bg-white shadow-soft border-b border-gray-200'
          : 'bg-white border-b border-gray-100'
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <NavLink
            to="/"
            className="text-2xl font-bold text-primary hover:scale-105 transition-transform duration-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            PrintEase
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              // Hide protected routes when not authenticated
              if ((link.to === '/order' || link.to === '/my-orders') && !isAuthenticated) {
                return null;
              }
              return renderLink(link);
            })}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="text-secondary-dark hover:text-primary transition-colors duration-smooth font-medium"
              >
                Admin
              </NavLink>
            )}
            {isDealer && (
              <NavLink
                to="/dealer"
                className="text-secondary-dark hover:text-primary transition-colors duration-smooth font-medium"
              >
                Dealer
              </NavLink>
            )}
            {isAuthenticated ? (
              <>
                <NotificationBell />
                {/* User Avatar/Initial */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm shadow-soft">
                    {getUserInitials()}
                  </div>
                  <span className="hidden lg:inline text-sm font-medium text-gray-700">
                    {user.name || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-primary transition-colors duration-smooth font-medium flex items-center gap-2"
                  title="Logout"
                >
                  <LogOut size={18} />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/customer/signup"
                  className="px-6 py-2 text-primary border-2 border-primary rounded-office font-semibold hover:bg-primary-light transition-all duration-smooth active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Sign Up
                </NavLink>
                <NavLink
                  to="/customer/login"
                  className="px-6 py-2 bg-primary text-white rounded-office font-semibold hover:bg-primary-dark transition-all duration-smooth shadow-soft hover:shadow-card active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Login
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-smooth ${
            isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-4 py-4 border-t border-gray-200">
            {navLinks.map((link) => {
              // Hide protected routes when not authenticated
              if ((link.to === '/order' || link.to === '/my-orders') && !isAuthenticated) {
                return null;
              }
              return renderLink(link);
            })}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="text-secondary-dark hover:text-primary transition-colors duration-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </NavLink>
            )}
            {isDealer && (
              <NavLink
                to="/dealer"
                className="text-secondary-dark hover:text-primary transition-colors duration-smooth font-medium"
                onClick={() => setIsOpen(false)}
              >
                Dealer
              </NavLink>
            )}
            {isAuthenticated ? (
              <>
                <div className="px-4" onClick={() => setIsOpen(false)}>
                  <NotificationBell />
                </div>
                {/* User Avatar/Initial - Mobile */}
                <div className="flex items-center gap-3 px-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm shadow-soft">
                    {getUserInitials()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.name || 'User'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="px-6 py-2 text-gray-700 hover:text-primary transition-colors duration-smooth font-medium flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/customer/signup"
                  className="px-6 py-2 text-primary border-2 border-primary rounded-full font-semibold text-center hover:bg-primary-light transition-all duration-smooth active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </NavLink>
                <NavLink
                  to="/customer/login"
                  className="px-6 py-2 bg-primary text-white rounded-full font-semibold text-center hover:bg-primary-dark transition-all duration-smooth shadow-soft active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

