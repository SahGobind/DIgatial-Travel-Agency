import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Globe, 
  Plane, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  Eye, 
  EyeOff, 
  AlertCircle,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemoCustomer, loginAsDemoAdmin } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Determine redirect target after login
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: 'customer@digitalworld.com',
      password: 'CustomerPass2026!',
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      setAuthError('');
      const loggedUser = await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (loggedUser.role === 'admin' || loggedUser.isStaff) {
        navigate('/admin');
      } else {
        navigate(from === '/login' ? '/dashboard' : from);
      }
    } catch (err) {
      setAuthError(err.customMessage || err.message || 'Failed to sign in. Please verify your email and password.');
    }
  };

  const handleDemoCustomerLogin = async () => {
    try {
      setIsDemoLoading(true);
      setAuthError('');
      await loginAsDemoCustomer();
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err.customMessage || 'Demo login failed. Please check server connection.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleDemoAdminLogin = async () => {
    try {
      setIsDemoLoading(true);
      setAuthError('');
      await loginAsDemoAdmin();
      navigate('/admin');
    } catch (err) {
      setAuthError(err.customMessage || 'Demo admin login failed.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F8FC]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6 relative">
        {/* Back to Previous Page / Home Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0B2A6F] transition cursor-pointer p-1.5 rounded-lg hover:bg-slate-100"
            title="Go back to previous page"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <Link
            to="/"
            className="text-xs font-semibold text-slate-400 hover:text-[#0B2A6F] transition"
          >
            Home
          </Link>
        </div>

        {/* Top Demo Notice Banner */}
        <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-[#0B2A6F]">
          <ShieldCheck className="w-4 h-4 text-[#0B2A6F] shrink-0" />
          <span>
            <strong>Demo Portal:</strong> Click <em>Continue as Demo Customer</em> for instant live API access.
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-block group">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#0B2A6F] flex items-center justify-center text-white shadow-md mb-3 group-hover:scale-105 transition-transform">
              <div className="relative">
                <Globe className="w-7 h-7" />
                <Plane className="w-4 h-4 absolute -top-1 -right-1 text-[#D71920]" />
              </div>
            </div>
          </Link>
          <h2 className="text-2xl font-black text-[#0B2A6F]">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to Digital World Tour &amp; Travels Portal
          </p>
        </div>

        {authError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{authError}</span>
          </div>
        )}

        {/* 1-Click Demo Action Button */}
        <button
          type="button"
          onClick={handleDemoCustomerLogin}
          disabled={isDemoLoading || isSubmitting}
          className="w-full py-3 px-4 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-lg disabled:opacity-75"
        >
          <UserCheck className="w-4 h-4" />
          <span>Continue as Demo Customer</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-slate-200"></div>
          <span className="shrink mx-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">or sign in with credentials</span>
          <div className="grow border-t border-slate-200"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="customer@digitalworld.com"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] transition ${
                  errors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-300 bg-slate-50/50'
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-[11px] text-red-600 mt-1 block font-medium">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password *
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-semibold text-[#0B2A6F] hover:text-[#D71920] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] transition ${
                  errors.password ? 'border-red-400 bg-red-50/20' : 'border-slate-300 bg-slate-50/50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[11px] text-red-600 mt-1 block font-medium">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 rounded border-slate-300 text-[#0B2A6F] focus:ring-[#0B2A6F]"
              />
              <span className="text-xs font-medium text-slate-600">Remember Me</span>
            </label>

            <button
              type="button"
              onClick={handleDemoAdminLogin}
              className="text-[11px] font-bold text-slate-400 hover:text-[#0B2A6F] hover:underline"
            >
              Demo Admin Login &rarr;
            </button>
          </div>

          {/* Login Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            isLoading={isSubmitting}
            className="w-full mt-2 justify-center shadow-md py-3 text-sm font-bold cursor-pointer"
          >
            Login
          </Button>
        </form>

        {/* Create Account Link */}
        <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#D71920] hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
