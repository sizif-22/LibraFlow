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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#000000] text-center">
        <div className="w-24 h-24 bg-[#111111] border border-[#222222] flex items-center justify-center rounded-full mb-8 shadow-2xl shadow-black">
          <ShieldAlert className="text-[#555555]" size={40} />
        </div>
        <h1 className="text-[32px] font-[800] text-white uppercase tracking-tight mb-4">Access Denied</h1>
        <p className="text-[14px] text-[#666666] max-w-md mb-10 leading-relaxed">
          You don't have the necessary permissions to view this archive sector. This area is restricted to <span className="text-white font-[600]">{allowedRoles.join(', ')}</span> personnel only.
        </p>
        <Link
          href="/books"
          className="bg-white hover:bg-[#eeeeee] text-black px-10 py-4 rounded-xl transition-all text-[12px] font-[800] uppercase tracking-[0.2em]"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
