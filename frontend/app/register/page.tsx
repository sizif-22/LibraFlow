'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api, { ApiError } from '@/lib/api';
import { BarChart3, Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'LIBRARIAN', 'ADMIN']),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'STUDENT' },
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
      <div className="flex-1 flex items-center justify-center w-full p-6">
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
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full h-[48px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] px-[16px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
              />
              {errors.password && <p className="text-[#888888] text-[11px] mt-1 ml-[2px]">{errors.password.message}</p>}
            </div>

            <div className="space-y-[6px]">
              <label className="text-[11px] text-[#888888] uppercase tracking-wide block ml-[2px]">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-[48px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] px-[16px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
              />
            </div>

            <div className="space-y-[6px]">
              <label className="text-[11px] text-[#888888] uppercase tracking-wide block ml-[2px]">Role</label>
              <select
                {...register('role')}
                className="w-full h-[48px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] px-[16px] text-white focus:outline-none focus:border-[#444444] transition-all text-[14px] appearance-none cursor-pointer"
              >
                <option value="STUDENT" className="bg-[#1a1a1a]">Student</option>
                <option value="LIBRARIAN" className="bg-[#1a1a1a]">Librarian</option>
                <option value="ADMIN" className="bg-[#1a1a1a]">Admin</option>
              </select>
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

