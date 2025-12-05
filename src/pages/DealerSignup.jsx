import { useState } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

export default function DealerSignup() {
  const navigate = useNavigate();
  const context = useOutletContext();
  const toast = context?.toast || { success: () => {}, error: () => {} };
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Business address is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      toast.success('Dealer registration submitted!', { 
        title: 'Registration Pending',
        message: 'Your registration is under review. You will be notified once approved.'
      });
      navigate('/dealer/login', { replace: true });
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: value }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Building2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register as Dealer</h1>
          <p className="text-gray-600">Join PrintEase as a dealer partner</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Business Information
            </h2>
            
            <Input
              id="businessName"
              name="businessName"
              type="text"
              label="Business Name"
              value={formData.businessName}
              onChange={handleChange}
              error={errors.businessName}
              required
              placeholder="Your Business Name"
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Business Email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="business@example.com"
              autoComplete="email"
            />

            <Input
              id="phone"
              name="phone"
              type="tel"
              label="Phone Number"
              value={formData.phone}
              onChange={handlePhoneChange}
              error={errors.phone}
              required
              placeholder="9876543210"
              autoComplete="tel"
            />

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your business address"
                required
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Password
            </h2>

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
                autoComplete="new-password"
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

            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              I agree to the Dealer Terms of Service and Privacy Policy
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Register as Dealer
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have a dealer account?{' '}
              <Link
                to="/dealer/login"
                className="text-green-600 font-semibold hover:text-green-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}

