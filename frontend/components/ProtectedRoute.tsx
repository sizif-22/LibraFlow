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
  const { token, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        router.push('/login');
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect based on role if not authorized
        if (user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (user.role === 'LIBRARIAN') {
          router.push('/librarian/dashboard');
        } else {
          router.push('/');
        }
      }
    }
  }, [token, user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-4 bg-slate-950">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-slate-400 animate-pulse">Loading secure session...</p>
      </div>
    );
  }

  if (!token) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
