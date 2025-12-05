import { useState } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

export default function DealerLogin() {
  const navigate = useNavigate();
  const context = useOutletContext();
  const toast = context?.toast || { success: () => {}, error: () => {} };
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      const result = login(formData.email, formData.password);
      
      if (result.success && result.user.role === 'dealer') {
        toast.success('Login successful!', { title: `Welcome ${result.user.name}` });
        navigate('/dealer/dashboard', { replace: true });
      } else {
        toast.error('Invalid email or password. Please use Dealer Login.');
      }
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Building2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dealer Login</h1>
          <p className="text-gray-600">Access your dealer portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="dealer@printease.in"
            autoComplete="email"
          />

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-green-600 hover:text-green-700"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Sign In as Dealer
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            New dealer?{' '}
            <Link
              to="/dealer/signup"
              className="text-green-600 font-semibold hover:text-green-700"
            >
              Register as Dealer
            </Link>
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <Link to="/customer/login" className="hover:text-gray-700">
              Customer Login
            </Link>
            <span>•</span>
            <Link to="/admin/login" className="hover:text-gray-700">
              Admin Login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

