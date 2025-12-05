import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { Mail, Phone, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import sampleUsers from '../data/sampleUsers.json';

const OTP_LENGTH = 6;
const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN = 60; // 60 seconds

export default function ForgotPassword() {
  const navigate = useNavigate();
  const context = useOutletContext();
  const toast = context?.toast || { success: () => {}, error: () => {} };
  const { login } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Enter email/phone, 2: Enter OTP
  const [formData, setFormData] = useState({
    emailOrPhone: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
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

  // Check OTP expiry and update UI
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

  // Load OTP session from localStorage on mount
  useEffect(() => {
    const otpSession = localStorage.getItem('printease_otp_session');
    if (otpSession) {
      try {
        const session = JSON.parse(otpSession);
        const now = Date.now();
        
        if (now < session.expiry) {
          // Session still valid
          setStep(2);
          setFormData({ emailOrPhone: session.emailOrPhone });
          setUserFound(session.user);
          setOtpExpiry(session.expiry);
          setResendTimer(Math.max(0, Math.floor((session.resendCooldown - now) / 1000)));
        } else {
          // Session expired, clear it
          localStorage.removeItem('printease_otp_session');
        }
      } catch (error) {
        console.error('Error loading OTP session:', error);
        localStorage.removeItem('printease_otp_session');
      }
    }
  }, []);

  const validateEmailOrPhone = (value) => {
    // Check if it's an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      return { type: 'email', valid: true };
    }
    
    // Check if it's a phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    const cleanedPhone = value.replace(/\D/g, '');
    if (phoneRegex.test(cleanedPhone)) {
      return { type: 'phone', valid: true, cleaned: cleanedPhone };
    }
    
    return { type: null, valid: false };
  };

  const findUserByEmailOrPhone = (emailOrPhone) => {
    const validation = validateEmailOrPhone(emailOrPhone);
    
    if (!validation.valid) {
      return null;
    }
    
    if (validation.type === 'email') {
      return sampleUsers.users.find((u) => u.email.toLowerCase() === emailOrPhone.toLowerCase());
    } else {
      // Search by phone (remove spaces, +, etc.)
      const searchPhone = validation.cleaned;
      return sampleUsers.users.find((u) => {
        const userPhone = u.phone.replace(/\D/g, '');
        return userPhone === searchPhone || userPhone.endsWith(searchPhone);
      });
    }
  };

  const generateOTP = () => {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const saveOTPSession = (emailOrPhone, user, generatedOTP) => {
    const now = Date.now();
    const session = {
      emailOrPhone,
      user,
      otp: generatedOTP,
      expiry: now + OTP_EXPIRY_TIME,
      resendCooldown: now + (RESEND_COOLDOWN * 1000),
      createdAt: now,
    };
    localStorage.setItem('printease_otp_session', JSON.stringify(session));
    return session;
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.emailOrPhone.trim()) {
      setErrors({ emailOrPhone: 'Email or phone number is required' });
      toast.error('Please enter your email or phone number');
      return;
    }

    const validation = validateEmailOrPhone(formData.emailOrPhone);
    if (!validation.valid) {
      setErrors({ emailOrPhone: 'Please enter a valid email address or 10-digit phone number' });
      toast.error('Invalid email or phone number format');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const user = findUserByEmailOrPhone(formData.emailOrPhone);
      
      if (!user) {
        setIsLoading(false);
        setErrors({ emailOrPhone: 'No account found with this email or phone number' });
        toast.error('No account found. Please check your email or phone number.');
        return;
      }

      // Generate OTP
      const generatedOTP = generateOTP();
      
      // Save OTP session
      const session = saveOTPSession(formData.emailOrPhone, user, generatedOTP);
      
      // In production, send OTP via email/SMS
      // For demo, show OTP in console and toast
      console.log('Generated OTP:', generatedOTP);
      toast.success(`OTP sent! (Demo: ${generatedOTP})`, { 
        title: 'OTP Sent',
        duration: 10000 
      });
      
      setUserFound(user);
      setStep(2);
      setOtpExpiry(session.expiry);
      setResendTimer(RESEND_COOLDOWN);
      setIsLoading(false);
    }, 1500);
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer} seconds before requesting a new OTP`);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const generatedOTP = generateOTP();
      const session = saveOTPSession(formData.emailOrPhone, userFound, generatedOTP);
      
      console.log('Resent OTP:', generatedOTP);
      toast.success(`OTP resent! (Demo: ${generatedOTP})`, { 
        title: 'OTP Resent',
        duration: 10000 
      });
      
      setOtpExpiry(session.expiry);
      setResendTimer(RESEND_COOLDOWN);
      setOtp(['', '', '', '', '', '']);
      setIsLoading(false);
      
      // Focus first OTP input
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: '' }));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Focus last input
      otpInputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    
    if (otpString.length !== OTP_LENGTH) {
      setErrors({ otp: 'Please enter the complete 6-digit OTP' });
      toast.error('Please enter all 6 digits of the OTP');
      return;
    }

    // Check expiry
    if (otpExpiry && Date.now() >= otpExpiry) {
      setErrors({ otp: 'OTP has expired. Please request a new one.' });
      toast.error('OTP has expired. Please request a new one.');
      setStep(1);
      localStorage.removeItem('printease_otp_session');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const otpSession = localStorage.getItem('printease_otp_session');
      
      if (!otpSession) {
        setIsLoading(false);
        setErrors({ otp: 'OTP session expired. Please request a new OTP.' });
        toast.error('OTP session expired. Please request a new OTP.');
        setStep(1);
        return;
      }

      try {
        const session = JSON.parse(otpSession);
        
        if (otpString !== session.otp) {
          setIsLoading(false);
          setErrors({ otp: 'Invalid OTP. Please try again.' });
          toast.error('Invalid OTP. Please check and try again.');
          return;
        }

        // OTP verified successfully
        // Auto-login the user
        const { password: _, ...userData } = session.user;
        const userObj = {
          ...userData,
          token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        // Use the login function from AuthContext
        const result = login(session.user.email, session.user.password);
        
        if (result.success) {
          // Clear OTP session
          localStorage.removeItem('printease_otp_session');
          
          toast.success('Login successful!', { title: `Welcome ${userObj.name}` });
          
          // Redirect based on role
          const redirectPath = 
            userObj.role === 'admin' ? '/admin' :
            userObj.role === 'dealer' ? '/dealer' :
            '/';
          
          navigate(redirectPath, { replace: true });
        } else {
          setIsLoading(false);
          toast.error('Failed to login. Please try again.');
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
        setIsLoading(false);
        setErrors({ otp: 'An error occurred. Please try again.' });
        toast.error('An error occurred. Please try again.');
      }
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 1 ? 'Forgot Password' : 'Verify OTP'}
          </h1>
          <p className="text-gray-600">
            {step === 1 
              ? 'Enter your email or phone number to receive an OTP'
              : `Enter the 6-digit OTP sent to ${formData.emailOrPhone}`
            }
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-6" noValidate>
            <div>
              <Input
                id="emailOrPhone"
                name="emailOrPhone"
                type="text"
                label="Email or Phone Number"
                value={formData.emailOrPhone}
                onChange={handleChange}
                error={errors.emailOrPhone}
                required
                placeholder="you@example.com or 9876543210"
                autoComplete="username"
                aria-describedby={errors.emailOrPhone ? 'emailOrPhone-error' : undefined}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your registered email address or 10-digit phone number
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Send OTP
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary hover:text-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter 6-Digit OTP
              </label>
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
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
                    className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                      errors.otp
                        ? 'border-red-500'
                        : digit
                        ? 'border-primary'
                        : 'border-gray-300'
                    }`}
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="mt-2 text-sm text-red-600" id="otp-error">
                  {errors.otp}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Clock size={16} className="mr-1" />
                <span>
                  {otpExpiry && Date.now() < otpExpiry
                    ? `Expires in ${formatTime(Math.floor((otpExpiry - Date.now()) / 1000))}`
                    : 'OTP expired'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || isLoading}
                className={`text-primary hover:text-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded ${
                  resendTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Verify OTP
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp(['', '', '', '', '', '']);
                  setErrors({});
                  localStorage.removeItem('printease_otp_session');
                }}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                <ArrowLeft size={16} className="mr-1" />
                Change Email/Phone
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

