'use client';

import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('STUDENT' | 'LIBRARIAN' | 'ADMIN')[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 bg-slate-950 text-center">
        <div className="bg-red-500/10 p-6 rounded-full mb-6">
          <ShieldAlert className="text-red-500" size={64} />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-slate-400 max-w-md mb-8">
          You don't have the necessary permissions to view this page. This area is restricted to {allowedRoles.join(', ')} users only.
        </p>
        <Link
          href="/books"
          className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl transition-all border border-white/10 font-medium"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
