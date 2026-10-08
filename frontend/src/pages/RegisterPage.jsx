import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Globe, 
  Plane, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  ArrowLeft,
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setAuthError('');
      await authRegister({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const msg = err.customMessage || err.message || 'Registration failed. Please verify your details.';
      setAuthError(msg);
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
            Create Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Join Digital World Tour &amp; Travels Portal
          </p>
        </div>

        {authError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{authError}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center space-y-4 py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Account Created!</h3>
            <p className="text-xs text-slate-500">
              Welcome aboard! Redirecting to your Customer Dashboard...
            </p>
            <div className="w-6 h-6 border-2 border-[#0B2A6F] border-t-transparent rounded-full animate-spin mx-auto mt-2" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Sonu Kumar Sah"
                  {...register('fullName', {
                    required: 'Full name is required',
                    minLength: { value: 3, message: 'Name must be at least 3 characters' },
                  })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] transition ${
                    errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-slate-300 bg-slate-50/50'
                  }`}
                />
              </div>
              {errors.fullName && (
                <span className="text-[11px] text-red-600 mt-1 block font-medium">
                  {errors.fullName.message}
                </span>
              )}
            </div>

            {/* 2. Email Address */}
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
                  placeholder="sonu.sah@gmail.com"
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

            {/* 3. Phone Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="9812193621"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9+ -]{7,15}$/,
                      message: 'Please enter a valid phone number',
                    },
                  })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] transition ${
                    errors.phone ? 'border-red-400 bg-red-50/20' : 'border-slate-300 bg-slate-50/50'
                  }`}
                />
              </div>
              {errors.phone && (
                <span className="text-[11px] text-red-600 mt-1 block font-medium">
                  {errors.phone.message}
                </span>
              )}
            </div>

            {/* 4. Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password *
              </label>
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

            {/* 5. Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A6F] transition ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50/20' : 'border-slate-300 bg-slate-50/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-[11px] text-red-600 mt-1 block font-medium">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            {/* Checkbox: Terms and Conditions */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('agreeTerms', {
                    required: 'You must agree to the Terms and Conditions to create an account',
                  })}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#0B2A6F] focus:ring-[#0B2A6F]"
                />
                <span className="text-xs text-slate-600 leading-snug">
                  I agree to the <span className="text-[#0B2A6F] font-bold hover:underline">Terms and Conditions</span> and Privacy Policy of Digital World Tour &amp; Travels.
                </span>
              </label>
              {errors.agreeTerms && (
                <span className="text-[11px] text-red-600 mt-1 block font-medium">
                  {errors.agreeTerms.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="danger"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              isLoading={isSubmitting}
              className="w-full mt-4 justify-center shadow-md py-3 text-sm font-bold cursor-pointer"
            >
              Create Account
            </Button>
          </form>
        )}

        {/* Existing Account Link */}
        <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#0B2A6F] hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
