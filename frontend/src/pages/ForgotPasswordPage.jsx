import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Globe, 
  Plane, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    await forgotPassword(data.email);
    setSubmittedEmail(data.email);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F8FC]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6 relative">
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
            Reset Password
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your registered email to receive recovery instructions
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Reset Link Sent!</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                We have prepared a password reset link for <strong className="text-slate-900">{submittedEmail}</strong>.
              </p>
            </div>

            {/* Demo Notice Alert */}
            <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-2xl text-left space-y-1 text-xs text-blue-950">
              <div className="flex items-center gap-2 font-bold text-[#0B2A6F]">
                <ShieldCheck className="w-4 h-4" /> Frontend Simulation Mode
              </div>
              <p className="text-[11px] text-blue-900/80">
                Since backend email dispatch is in prototyping stage, you can return to login and sign in with any demo credentials or use <strong>Continue as Demo Customer</strong>.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0B2A6F] hover:text-[#D71920] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Registered Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
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

            {/* Submit Button: Send Reset Link */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={KeyRound}
              isLoading={isSubmitting}
              className="w-full mt-3 justify-center shadow-md py-3 text-sm font-bold cursor-pointer"
            >
              Send Reset Link
            </Button>
          </form>
        )}

        {/* Back to Login */}
        <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-600">
          Remember your password?{' '}
          <Link to="/login" className="font-bold text-[#0B2A6F] hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
