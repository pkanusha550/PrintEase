import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Phone, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import sampleUsers from '../data/sampleUsers.json';

const OTP_LENGTH = 6;
const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN = 60; // 60 seconds

export default function CustomerLogin() {
  const navigate = useNavigate();
  const context = useOutletContext();
  const toast = context?.toast || { success: () => {}, error: () => {} };
  const { login, loginWithOTP } = useAuth();
  
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [step, setStep] = useState(1); // For OTP: 1: Enter email/phone, 2: Enter OTP
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    emailOrPhone: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [userFound, setUserFound] = useState(null);
  const otpInputRefs = useRef([]);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // Check OTP expiry
  useEffect(() => {
    if (otpExpiry) {
      const checkExpiry = setInterval(() => {
        const now = Date.now();
        if (now >= otpExpiry) {
          toast.error('OTP has expired. Please request a new one.');
          setStep(1);
          setOtpExpiry(null);
          setOtp(['', '', '', '', '', '']);
          localStorage.removeItem('printease_otp_session');
          clearInterval(checkExpiry);
        }
      }, 1000);
      return () => clearInterval(checkExpiry);
    }
  }, [otpExpiry, toast]);

  const validatePasswordLogin = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmailOrPhone = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      return { type: 'email', valid: true };
    }
    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = value.replace(/\D/g, '');
    if (phoneRegex.test(cleanPhone)) {
      return { type: 'phone', valid: true, cleaned: cleanPhone };
    }
    return { valid: false };
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!validatePasswordLogin()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const result = login(formData.email, formData.password);
      
      if (result.success && result.user.role === 'customer') {
        toast.success('Login successful!', { title: `Welcome ${result.user.name}` });
        navigate('/customer/dashboard', { replace: true });
      } else {
        toast.error('Invalid email or password. Please use Customer Login.');
      }
    }, 1500);
  };

  const handleOTPRequest = async () => {
    if (!formData.emailOrPhone.trim()) {
      toast.error('Please enter your email or phone number');
      return;
    }

    const validation = validateEmailOrPhone(formData.emailOrPhone);
    if (!validation.valid) {
      toast.error('Please enter a valid email or 10-digit phone number');
      return;
    }

    setIsLoading(true);
    
    // Find user by email or phone
    const user = sampleUsers.users.find((u) => {
      if (validation.type === 'email') {
        return u.email === formData.emailOrPhone && u.role === 'customer';
      } else {
        const userPhone = u.phone.replace(/\D/g, '');
        return userPhone === validation.cleaned && u.role === 'customer';
      }
    });

    setTimeout(() => {
      setIsLoading(false);
      
      if (!user) {
        toast.error('No customer account found with this email/phone');
        return;
      }

      // Generate mock OTP
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Generated OTP for customer:', generatedOTP);

      const expiry = Date.now() + OTP_EXPIRY_TIME;
      const resendCooldown = Date.now() + RESEND_COOLDOWN * 1000;

      const session = {
        emailOrPhone: formData.emailOrPhone,
        otp: generatedOTP,
        expiry,
        resendCooldown,
        user: { ...user, password: undefined },
      };

      localStorage.setItem('printease_otp_session', JSON.stringify(session));
      setUserFound(user);
      setStep(2);
      setOtpExpiry(expiry);
      setResendTimer(RESEND_COOLDOWN);
      toast.success('OTP sent successfully!');
    }, 1000);
  };

  const handleOTPVerify = async () => {
    const enteredOTP = otp.join('');
    if (enteredOTP.length !== OTP_LENGTH) {
      toast.error('Please enter the complete OTP');
      return;
    }

    const otpSession = localStorage.getItem('printease_otp_session');
    if (!otpSession) {
      toast.error('OTP session expired. Please request a new OTP.');
      setStep(1);
      return;
    }

    try {
      const session = JSON.parse(otpSession);
      const now = Date.now();

      if (now >= session.expiry) {
        toast.error('OTP has expired. Please request a new one.');
        setStep(1);
        localStorage.removeItem('printease_otp_session');
        return;
      }

      if (enteredOTP !== session.otp) {
        toast.error('Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
        return;
      }

      // OTP verified, login user
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const result = loginWithOTP(session.user.email, session.user);
        
        if (result.success) {
          toast.success('Login successful!', { title: `Welcome ${result.user.name}` });
          localStorage.removeItem('printease_otp_session');
          navigate('/customer/dashboard', { replace: true });
        } else {
          toast.error(result.error || 'Login failed');
        }
      }, 500);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Error verifying OTP. Please try again.');
    }
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    handleOTPRequest();
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === OTP_LENGTH) {
      handleOTPVerify();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, OTP_LENGTH);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < OTP_LENGTH; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      if (pastedData.length === OTP_LENGTH) {
        otpInputRefs.current[OTP_LENGTH - 1]?.focus();
        setTimeout(() => handleOTPVerify(), 100);
      } else {
        otpInputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <User size={32} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Login</h1>
          <p className="text-gray-600">Sign in to your PrintEase customer account</p>
        </div>

        {/* Login Method Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('password');
              setStep(1);
              setErrors({});
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginMethod === 'password'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('otp');
              setStep(1);
              setErrors({});
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginMethod === 'otp'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            OTP Login
          </button>
        </div>

        {/* Password Login Form */}
        {loginMethod === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-6" noValidate>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              error={errors.email}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />

            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, password: e.target.value }));
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
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
                className="text-sm text-blue-600 hover:text-blue-700"
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
              Sign In
            </Button>
          </form>
        )}

        {/* OTP Login Form */}
        {loginMethod === 'otp' && (
          <div className="space-y-6">
            {step === 1 && (
              <>
                <div>
                  <Input
                    id="emailOrPhone"
                    name="emailOrPhone"
                    type="text"
                    label="Email or Phone Number"
                    value={formData.emailOrPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emailOrPhone: e.target.value }))}
                    placeholder="Email or 10-digit phone"
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleOTPRequest}
                  isLoading={isLoading}
                  className="w-full"
                >
                  Send OTP
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    OTP sent to <strong>{formData.emailOrPhone}</strong>
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0}
                      className={`text-blue-600 hover:text-blue-700 ${
                        resendTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                    {otpExpiry && (
                      <span className="text-gray-500">
                        Expires in {Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000))}s
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleOTPVerify}
                    isLoading={isLoading}
                    className="w-full"
                  >
                    Verify OTP
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/customer/signup"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Sign up as Customer
            </Link>
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <Link to="/dealer/login" className="hover:text-gray-700">
              Dealer Login
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

