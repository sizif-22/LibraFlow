'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api, { ApiError } from '@/lib/api';
import { useAuth, User } from '@/context/AuthContext';
import { BarChart3, Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setJustRegistered(true);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/login', data);
      const { token, user } = response.data;
      login(token, user);
      router.push('/books');
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError((apiError.response?.data as { message?: string })?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-between">
      <div className="flex-1 flex items-center justify-center w-full p-6">
        <div className="w-full max-w-[420px] bg-[#1a1a1a] rounded-[16px] border border-[#2a2a2a] p-[48px] shadow-2xl">
          <div className="flex flex-col items-center">
            <BarChart3 className="text-[#555555] mb-2" size={24} />
            <h1 className="text-[28px] font-[700] text-white leading-tight">LibraFlow</h1>
            <p className="text-[13px] text-[#888888]">Academic Archive System</p>
            
            <div className="h-[32px]" />
            
            <h2 className="text-[20px] font-[600] text-white">Welcome Back</h2>
            <p className="text-[14px] text-[#888888]">Access your scholarly repository</p>
            
            <div className="h-[24px]" />
          </div>

          {justRegistered && (
            <div className="bg-white/5 border border-white/10 text-white/80 px-4 py-2 rounded-[8px] text-[12px] mb-4 text-center">
              Registration successful! You can now log in.
            </div>
          )}

          {error && (
            <div className="bg-white/5 border border-[#333333] text-white/70 px-4 py-2 rounded-[8px] text-[12px] mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-[16px]">
            <div className="space-y-[8px]">
              <label className="text-[12px] text-[#aaaaaa] uppercase tracking-wide block ml-[2px]">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="Enter academic email"
                className="w-full h-[48px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] px-[16px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
              />
              {errors.email && <p className="text-[#888888] text-[11px] mt-1 ml-[2px]">{errors.email.message}</p>}
            </div>

            <div className="space-y-[8px]">
              <div className="flex justify-between items-center px-[2px]">
                <label className="text-[12px] text-[#aaaaaa] uppercase tracking-wide">Password</label>
                <Link href="#" className="text-[12px] text-[#888888] hover:text-white transition-colors">Forgot?</Link>
              </div>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full h-[48px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] px-[16px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
              />
              {errors.password && <p className="text-[#888888] text-[11px] mt-1 ml-[2px]">{errors.password.message}</p>}
            </div>

            <div className="h-[8px]" />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] bg-white text-black text-[16px] font-[500] rounded-[8px] hover:bg-[#eeeeee] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-black" size={20} />
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="h-[24px] border-b border-[#2a2a2a] mb-[24px]" />

          <p className="text-center text-[14px]">
            <span className="text-[#888888]">Don&apos;t have an account? </span>
            <Link href="/register" className="text-white font-[600] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

