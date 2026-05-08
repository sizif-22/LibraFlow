'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api, { ApiError } from '@/lib/api';
import { BarChart3, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/register', data);
      router.push('/login?registered=true');
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError((apiError.response?.data as { message?: string })?.message || 'Registration failed. Please try again.');
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
        <div className="w-full max-w-[420px] bg-[#1a1a1a] rounded-[16px] border border-[#2a2a2a] p-[48px] shadow-2xl">
          <div className="flex flex-col items-center">
            <BarChart3 className="text-[#555555] mb-2" size={24} />
            <h1 className="text-[28px] font-[700] text-white leading-tight">LibraFlow</h1>
            <p className="text-[13px] text-[#888888]">Academic Archive Access</p>
            
            <div className="h-[24px]" />
            
            <h2 className="text-[24px] font-[700] text-white">Create Account</h2>
            <p className="text-[14px] text-[#888888]">Join the university&apos;s digital repository.</p>
            
            <div className="h-[24px]" />
          </div>

          {error && (
            <div className="bg-white/5 border border-[#333333] text-white/70 px-4 py-2 rounded-[8px] text-[12px] mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-[12px]">
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
              className="w-full h-[52px] bg-white text-black text-[16px] font-[500] rounded-[8px] hover:bg-[#eeeeee] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-black" size={20} />
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="h-[24px]" />

          <p className="text-center text-[14px]">
            <span className="text-[#888888]">Already have an account? </span>
            <Link href="/login" className="text-white font-[600] hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

