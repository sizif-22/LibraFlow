'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'LIBRARIAN' | 'ADMIN')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        router.push('/login');
      } else if (user) {
        // 1. Check Activity (Admin Ban)
        if (!user.isActive) {
          logout();
          router.push('/login?error=banned');
          return;
        }

        // 2. Check Verification (Email Activation)
        const isActivationPage = window.location.pathname === '/activate';
        if (!user.isVerified && !isActivationPage) {
          router.push('/activate');
          return;
        }

        // 3. Prevent verified users from accessing activation page
        if (user.isVerified && isActivationPage) {
          router.push('/');
          return;
        }

        // 4. Role Authorization
        if (allowedRoles && !allowedRoles.includes(user.role)) {
          if (user.role === 'ADMIN') router.push('/admin/dashboard');
          else if (user.role === 'LIBRARIAN') router.push('/librarian/dashboard');
          else router.push('/student/dashboard');
        }
      }
    }
  }, [token, user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <Loader2 className="animate-spin text-[#555555]" size={24} />
      </div>
    );
  }

  if (!token) return null;
  if (user && !user.isActive) return null;
  if (user && !user.isVerified && window.location.pathname !== '/activate') return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
