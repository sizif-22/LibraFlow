'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import AdminLayout from '@/components/AdminLayout';
import {
  getPendingBorrows,
  approveBorrow,
  rejectBorrow,
} from '@/lib/api/borrows';
import { Borrow } from '@/lib/types/borrow';
import { Loader2 } from 'lucide-react';

// ─── BorrowRequestCard ────────────────────────────────────────────────────────

function BorrowRequestCard({
  borrow,
  onApprove,
  onReject,
  isActing,
}: {
  borrow: Borrow;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isActing: boolean;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#222222] rounded-[12px] p-[28px] flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <span className="bg-transparent border border-[#444444] text-white text-[10px] uppercase tracking-widest px-[10px] py-[3px] rounded-[4px] font-[500]">
          PENDING
        </span>
        <span className="text-[11px] text-[#555555]">ID: #BR-89{borrow.id}</span>
      </div>

      <div className="flex-1">
        <h3 className="text-[24px] font-[800] text-white leading-[1.2] mb-1">
          {borrow.book.title}
        </h3>
        <p className="text-[13px] text-[#666666] mb-6">
          {borrow.book.author} — Academic Archive
        </p>

        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#555555] uppercase tracking-widest">BORROWER</span>
            <span className="text-[14px] text-white font-[500]">{borrow.student.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#555555] uppercase tracking-widest">FACULTY</span>
            <span className="text-[14px] text-white font-[500]">Department of Research</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-[#555555] uppercase tracking-widest">DURATION</span>
            <span className="text-[14px] text-white font-[500]">14 Days (Standard)</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-auto">
        <button
          onClick={() => onReject(borrow.id)}
          disabled={isActing}
          className="flex-1 bg-[#1a1a1a] border border-[#333333] text-white text-[12px] font-[600] uppercase rounded-[6px] h-[44px] hover:bg-[#222222] transition-all disabled:opacity-50"
        >
          {isActing ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'REJECT'}
        </button>
        <button
          onClick={() => onApprove(borrow.id)}
          disabled={isActing}
          className="flex-1 bg-white text-black text-[12px] font-[600] uppercase rounded-[6px] h-[44px] hover:bg-[#eeeeee] transition-all disabled:opacity-50"
        >
          {isActing ? <Loader2 size={14} className="animate-spin mx-auto text-black" /> : 'APPROVE'}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LibrarianBorrowsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPendingBorrows();
      setBorrows(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('Failed to fetch pending borrows:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchPending();
    }
  }, [fetchPending, token]);

  const handleApprove = async (id: number) => {
    setActingId(id);
    try {
      await approveBorrow(id);
      setBorrows((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Failed to approve borrow:', err);
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setActingId(id);
    try {
      await rejectBorrow(id);
      setBorrows((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Failed to reject borrow:', err);
    } finally {
      setActingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['LIBRARIAN', 'ADMIN']}>
        <AdminLayout showSearch={false}>
          <header className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-[40px] font-[800] text-white leading-tight">Borrow Requests</h1>
              <p className="text-[14px] text-[#888888] mt-2 max-w-[500px] leading-relaxed">
                Review and authorize academic material circulation across the university network. Precision in archiving is paramount.
              </p>
            </div>
            <div className="flex gap-12 text-right">
              <div>
                <div className="text-[10px] text-[#666666] uppercase tracking-[0.2em] mb-1 font-[600]">PENDING TOTAL</div>
                <div className="text-[28px] font-[800] text-white">24</div>
              </div>
              <div>
                <div className="text-[10px] text-[#666666] uppercase tracking-[0.2em] mb-1 font-[600]">AVG RESPONSE</div>
                <div className="text-[28px] font-[800] text-white">1.2D</div>
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="animate-spin text-white" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[20px]">
              {borrows.length > 0 ? (
                borrows.map((borrow) => (
                  <BorrowRequestCard
                    key={borrow.id}
                    borrow={borrow}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isActing={actingId === borrow.id}
                  />
                ))
              ) : (
                <div className="col-span-full py-32 text-center text-[#555555] uppercase tracking-widest text-[14px]">
                  No pending requests in queue
                </div>
              )}
            </div>
          )}
        </AdminLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

