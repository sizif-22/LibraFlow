'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { ApiError } from '@/lib/api';
import { Loader2, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError((apiError.response?.data as { message?: string })?.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const onStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/reset-password', {
        email,
        code,
        newPassword
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError((apiError.response?.data as { message?: string })?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-between">
        <div className="flex-1 flex flex-col items-center justify-center w-full p-6">
          <div className="w-full max-w-[420px] bg-[#1a1a1a] rounded-[16px] border border-[#2a2a2a] p-[48px] shadow-2xl text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 size={64} className="text-[#4ade80]" />
            </div>
            <h2 className="text-[24px] font-bold text-white mb-2">Password Reset!</h2>
            <p className="text-[14px] text-[#888888]">Your password has been updated successfully. Redirecting you to login...</p>
            <div className="mt-8">
               <Loader2 className="animate-spin mx-auto text-[#555555]" size={24} />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-between">
      <div className="flex-1 flex flex-col items-center justify-center w-full p-6">
        <Link 
          href="/login" 
          className="flex items-center gap-2 text-[#888888] hover:text-white transition-all text-[13px] mb-8 self-center sm:self-auto sm:mr-[340px]"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>
        <div className="w-full max-w-[420px] bg-[#1a1a1a] rounded-[16px] border border-[#2a2a2a] p-[48px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-[#111111]">
            <div 
              className="h-full bg-white transition-all duration-500" 
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>

          <div className="flex flex-col items-center">
            <KeyRound className="text-[#555555] mb-2" size={24} />
            <h1 className="text-[28px] font-bold text-white leading-tight">LibraFlow</h1>
            <p className="text-[13px] text-[#888888]">Academic Archive Access</p>
            
            <div className="h-[24px]" />
            
            <h2 className="text-[24px] font-bold text-white">
              {step === 1 ? 'Forgot Password?' : 'Reset Password'}
            </h2>
            <p className="text-[14px] text-[#888888] text-center">
              {step === 1 
                ? "Enter your email to receive a reset code." 
                : `Enter the code sent to ${email} and your new password.`}
            </p>
            
            <div className="h-[24px]" />
          </div>

          {error && (
            <div className="bg-white/5 border border-[#333333] text-white/70 px-4 py-2 rounded-[8px] text-[12px] mb-4 text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={onStep1Submit} className="w-full space-y-[12px]">
              <div className="space-y-[6px]">
                <label className="text-[11px] text-[#888888] uppercase tracking-wide block ml-[2px]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full h-[48px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] px-[16px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
                  required
                />
              </div>

              <div className="h-[12px]" />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-white text-black text-[16px] font-medium rounded-[8px] hover:bg-[#eeeeee] transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={onStep2Submit} className="w-full space-y-[12px]">
              <div className="space-y-[6px]">
                <label className="text-[11px] text-[#888888] uppercase tracking-widest block text-center font-semibold">6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full h-[48px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] px-[16px] text-white text-center text-[18px] tracking-[4px] font-semibold focus:outline-none focus:border-[#ffffff] transition-all"
                  required
                />
              </div>

              <div className="space-y-[6px]">
                <label className="text-[11px] text-[#888888] uppercase tracking-wide block ml-[2px]">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[48px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] px-[16px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
                  required
                />
              </div>

              <div className="space-y-[6px]">
                <label className="text-[11px] text-[#888888] uppercase tracking-wide block ml-[2px]">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[48px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] px-[16px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
                  required
                />
              </div>

              <div className="h-[12px]" />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-white text-black text-[16px] font-semibold rounded-[8px] hover:bg-[#eeeeee] transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
              </button>
              
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-[#888888] text-[13px] hover:text-white transition-colors py-2"
              >
                Resend Code or Change Email
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
