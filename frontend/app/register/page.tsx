/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api, { ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { BarChart3, Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Footer from '@/components/Footer';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [formData, setFormData] = useState<RegisterForm | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onStep1Submit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);
    try {
      // Step 1: Send verification code
      await api.post('/auth/send-verification', data);
      setFormData(data);
      setStep(2);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError((apiError.response?.data as { message?: string })?.message || 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const onStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Step 2: Verify and Register
      const response = await api.post('/auth/verify', {
        email: formData.email,
        code: verificationCode
      });
      
      const { token, user } = response.data as { token: string, user: any };
      
      // Auto Login
      authLogin(token, user);

      // Redirect based on role
      if (user.role === 'ADMIN') router.push('/admin/dashboard');
      else if (user.role === 'LIBRARIAN') router.push('/librarian/dashboard');
      else router.push('/student/dashboard');

    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError((apiError.response?.data as { message?: string })?.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-between">
      <div className="flex-1 flex flex-col items-center justify-center w-full p-6">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[#888888] hover:text-white transition-all text-[13px] mb-8 self-center sm:self-auto sm:mr-[340px]"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <div className="w-full max-w-[420px] bg-[#1a1a1a] rounded-[16px] border border-[#2a2a2a] p-[48px] shadow-2xl relative overflow-hidden">
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-[4px] bg-[#111111]">
            <div 
              className="h-full bg-white transition-all duration-500" 
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>

          <div className="flex flex-col items-center">
            <BarChart3 className="text-[#555555] mb-2" size={24} />
            <h1 className="text-[28px] font-bold text-white leading-tight">LibraFlow</h1>
            <p className="text-[13px] text-[#888888]">Academic Archive Access</p>
            
            <div className="h-[24px]" />
            
            <h2 className="text-[24px] font-bold text-white">
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </h2>
            <p className="text-[14px] text-[#888888] text-center">
              {step === 1 
                ? "Join the university's digital repository." 
                : `Enter the 6-digit code sent to ${formData?.email}`}
            </p>
            
            <div className="h-[24px]" />
          </div>

          {error && (
            <div className="bg-white/5 border border-[#333333] text-white/70 px-4 py-2 rounded-[8px] text-[12px] mb-4 text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit(onStep1Submit)} className="w-full space-y-[12px]">
              <div className="space-y-[6px]">
                <label className="text-[11px] text-[#888888] uppercase tracking-wide block ml-[2px]">Full Name</label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Enter your official name"
                  className="w-full h-[48px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] px-[16px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
                />
                {errors.name && <p className="text-[#888888] text-[11px] mt-1 ml-[2px]">{errors.name.message}</p>}
              </div>

              <div className="space-y-[6px]">
                <label className="text-[11px] text-[#888888] uppercase tracking-wide block ml-[2px]">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="student@university.edu"
                  className="w-full h-[48px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] px-[16px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
                />
                {errors.email && <p className="text-[#888888] text-[11px] mt-1 ml-[2px]">{errors.email.message}</p>}
              </div>

              <div className="space-y-[6px]">
                <label className="text-[11px] text-[#888888] uppercase tracking-wide block ml-[2px]">Password</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-[48px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] pl-[16px] pr-[44px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#888888] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-[#888888] text-[11px] mt-1 ml-[2px]">{errors.password.message}</p>}
              </div>

              <div className="space-y-[6px]">
                <label className="text-[11px] text-[#888888] uppercase tracking-wide block ml-[2px]">Confirm Password</label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-[48px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] pl-[16px] pr-[44px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#888888] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[#888888] text-[11px] mt-1 ml-[2px]">{errors.confirmPassword.message}</p>}
              </div>

              <div className="h-[12px]" />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-white text-black text-[16px] font-medium rounded-[8px] hover:bg-[#eeeeee] transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={onStep2Submit} className="w-full space-y-[20px]">
              <div className="space-y-[12px]">
                <div className="flex justify-center">
                  <ShieldCheck size={48} className="text-[#4ade80]" />
                </div>
                <label className="text-[11px] text-[#888888] uppercase tracking-widest block text-center font-semibold">6-Digit Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full h-[52px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] px-[16px] text-white text-center text-[20px] tracking-[4px] font-semibold focus:outline-none focus:border-[#ffffff] transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full h-[52px] bg-white text-black text-[16px] font-semibold rounded-[8px] hover:bg-[#eeeeee] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Register'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-[#888888] text-[13px] hover:text-white transition-colors py-2"
                >
                  Change Email or Details
                </button>
              </div>
            </form>
          )}

          <div className="h-[24px]" />

          <p className="text-center text-[14px]">
            <span className="text-[#888888]">Already have an account? </span>
            <Link href="/login" className="text-white font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
