import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'New Order', to: '/order' },
  { label: 'My Orders', to: '/my-orders' },
  { label: 'Chatbot', to: '/#chatbot' },
  { label: 'Contact', to: '/#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

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
        className="text-gray-700 hover:text-primary transition-colors duration-smooth font-medium"
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
          `text-gray-700 hover:text-primary transition-colors duration-smooth font-medium ${
            isActive ? 'text-primary' : ''
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
          ? 'bg-white/95 backdrop-blur-md shadow-soft'
          : 'bg-white/80 backdrop-blur-sm'
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
            {navLinks.map(renderLink)}
            <NavLink
              to="/signup"
              className="px-6 py-2 text-primary border-2 border-primary rounded-full font-semibold hover:bg-primary-light transition-all duration-smooth active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Sign Up
            </NavLink>
            <NavLink
              to="/login"
              className="px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all duration-smooth shadow-soft hover:shadow-card active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Login
            </NavLink>
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
            {navLinks.map(renderLink)}
            <NavLink
              to="/signup"
              className="px-6 py-2 text-primary border-2 border-primary rounded-full font-semibold text-center hover:bg-primary-light transition-all duration-smooth active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={() => setIsOpen(false)}
            >
              Sign Up
            </NavLink>
            <NavLink
              to="/login"
              className="px-6 py-2 bg-primary text-white rounded-full font-semibold text-center hover:bg-primary-dark transition-all duration-smooth shadow-soft active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={() => setIsOpen(false)}
            >
              Login
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}

