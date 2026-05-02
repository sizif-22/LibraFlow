/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import AdminLayout from '@/components/AdminLayout';
import { returnBorrow } from '@/lib/api/borrows';
import { Borrow } from '@/lib/types/borrow';
import { Archive, Loader2 } from 'lucide-react';

export default function LibrarianReturnsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveBorrows = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/borrows/active`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (res.ok) {
        const json = await res.json();
        setBorrows(json.borrows ?? []);
      } else {
        setBorrows([]);
      }
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('Failed to fetch active borrows:', err);
      }
      setBorrows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchActiveBorrows();
    }
  }, [fetchActiveBorrows, token]);

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['LIBRARIAN', 'ADMIN']}>
        <AdminLayout showSearch={false} pageTitle="Record Returns">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'PENDING TODAY', value: '0' },
              { label: 'OVERDUE BOOKS', value: '12' },
              { label: 'AVG PROCESSING', value: '2.4m' },
              { label: 'TOTAL SHELVED', value: '842' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[24px] px-[28px]">
                <div className="text-[10px] text-[#666666] uppercase tracking-widest font-[500]">{stat.label}</div>
                <div className="text-[40px] font-[800] text-white mt-2 leading-none">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Main Content Card */}
          <div className="bg-[#1a1a1a] border border-[#222222] rounded-[12px] min-h-[400px] flex flex-col items-center justify-center p-12 text-center">
            {isLoading ? (
              <Loader2 className="animate-spin text-white" size={40} />
            ) : (
              <>
                <Archive size={48} className="text-[#333333] mb-5" />
                <h2 className="text-[24px] font-[800] text-white mb-4">No Pending Returns</h2>
                <p className="text-[14px] text-[#666666] max-w-[400px] leading-relaxed mb-8">
                  Everything is currently accounted for. The library&apos;s circulation is currently in perfect equilibrium.
                </p>
                <button className="bg-transparent border border-[#333333] text-white text-[13px] font-[500] px-[28px] py-[12px] rounded-[6px] hover:border-[#444444] transition-all">
                  View Circulation History
                </button>
              </>
            )}
          </div>
        </AdminLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

