/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api, { ApiError } from '@/lib/api';
import { BarChart3, Loader2, ShieldCheck, Mail, CheckCircle2, LogOut } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ActivatePage() {
  const router = useRouter();
  const { user, login, logout, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1); // 1: Info/Request, 2: Enter Code
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user?.isVerified) {
      if (user.role === 'ADMIN') router.push('/admin/dashboard');
      else if (user.role === 'LIBRARIAN') router.push('/librarian/dashboard');
      else router.push('/books');
    }
  }, [user, authLoading, router]);

  const handleRequestActivation = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/request-activation', { email: user.email });
      setStep(2);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError((apiError.response?.data as { message?: string })?.message || 'Failed to send activation code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/activate', {
        email: user.email,
        code: code
      });
      
      const { user: updatedUser } = response.data as { user: any };
      
      // Update local auth state
      const token = localStorage.getItem('token');
      if (token) {
        login(token, updatedUser);
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        if (updatedUser.role === 'ADMIN') router.push('/admin/dashboard');
        else if (updatedUser.role === 'LIBRARIAN') router.push('/librarian/dashboard');
        else router.push('/student/dashboard');
      }, 2000);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError((apiError.response?.data as { message?: string })?.message || 'Invalid activation code.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (!user && !isSuccess)) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[420px] bg-[#1a1a1a] rounded-[16px] border border-[#2a2a2a] p-[48px] shadow-2xl text-center">
          <CheckCircle2 size={64} className="text-[#4ade80] mx-auto mb-6" />
          <h2 className="text-[24px] font-bold text-white mb-2">Account Activated!</h2>
          <p className="text-[14px] text-[#888888]">Your account is now fully active. Redirecting you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-between">
      <div className="flex-1 flex flex-col items-center justify-center w-full p-6">
        <div className="w-full max-w-[420px] bg-[#1a1a1a] rounded-[16px] border border-[#2a2a2a] p-[48px] shadow-2xl relative overflow-hidden">
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
            
            <h2 className="text-[24px] font-bold text-white text-center">
              {step === 1 ? 'Activate Your Account' : 'Verify Identity'}
            </h2>
            <p className="text-[14px] text-[#888888] text-center">
              {step === 1 
                ? "Your account was created by an administrator. Please activate it to continue." 
                : `Enter the 6-digit code sent to ${user?.email}`}
            </p>
            
            <div className="h-[24px]" />
          </div>

          {error && (
            <div className="bg-white/5 border border-[#333333] text-white/70 px-4 py-2 rounded-[8px] text-[12px] mb-4 text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
               <div className="bg-[#111111] p-4 rounded-lg border border-[#222222] flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                    <Mail size={18} className="text-[#555555]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#555555] uppercase font-bold tracking-wider">Email Address</p>
                    <p className="text-[14px] text-white">{user?.email}</p>
                  </div>
               </div>
               
               <button
                  onClick={handleRequestActivation}
                  disabled={isLoading}
                  className="w-full h-[52px] bg-white text-black text-[16px] font-bold rounded-[8px] hover:bg-[#eeeeee] transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Activation Code'}
                </button>

                <button
                  onClick={() => logout()}
                  className="w-full flex items-center justify-center gap-2 text-[#555555] hover:text-white text-[13px] transition-colors py-2"
                >
                  <LogOut size={14} />
                  Logout and try another account
                </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyActivation} className="space-y-6">
              <div className="space-y-3 text-center">
                <ShieldCheck size={48} className="text-[#4ade80] mx-auto" />
                <label className="text-[11px] text-[#888888] uppercase tracking-widest block font-semibold">6-Digit Activation Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full h-[52px] bg-[#2a2a2a] border border-[#333333] rounded-[8px] px-[16px] text-white text-center text-[20px] tracking-[4px] font-semibold focus:outline-none focus:border-white transition-all"
                  required
                />
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-full h-[52px] bg-white text-black text-[16px] font-bold rounded-[8px] hover:bg-[#eeeeee] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Activate Now'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-[#888888] text-[13px] hover:text-white transition-colors py-2 text-center"
                >
                  Didn&apos;t receive code? Resend
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
