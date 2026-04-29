'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import {
  getPendingBorrows,
  approveBorrow,
  rejectBorrow,
} from '@/lib/api/borrows';
import { Borrow, BorrowType } from '@/lib/types/borrow';
import {
  ClipboardList, User, BookOpen, Calendar,
  CheckCircle, XCircle, Loader2, RefreshCw, Clock,
  BookMarked, Newspaper, GraduationCap,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (dateStr: string | null) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const TYPE_CONFIG: Record<BorrowType, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  [BorrowType.BOOK]: {
    label: 'Book',
    icon: BookOpen,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
  [BorrowType.MAGAZINE]: {
    label: 'Magazine',
    icon: Newspaper,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  [BorrowType.THESIS]: {
    label: 'Thesis',
    icon: GraduationCap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
};

const DUE_DAYS: Record<BorrowType, number> = {
  [BorrowType.BOOK]: 14,
  [BorrowType.MAGAZINE]: 7,
  [BorrowType.THESIS]: 3,
};

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
  const typeCfg = TYPE_CONFIG[borrow.type];
  const TypeIcon = typeCfg.icon;
  const dueDays = DUE_DAYS[borrow.type];

  const estimatedDue = (() => {
    const d = new Date();
    d.setDate(d.getDate() + dueDays);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  })();

  return (
    <div className="glass-dark rounded-2xl border border-white/5 hover:border-white/10 p-6 transition-all group">
      {/* Top row: student + book */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
        {/* Book icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <BookMarked size={22} className="text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Book title */}
          <h3 className="text-white font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {borrow.book.title}
          </h3>
          <p className="text-slate-500 text-sm mt-0.5">{borrow.book.author}</p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
            {/* Student */}
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <User size={12} className="text-slate-500" />
              {borrow.student.name}
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">{borrow.student.email}</span>
            </span>

            {/* Borrow type badge */}
            <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${typeCfg.color} ${typeCfg.bg} ${typeCfg.border}`}>
              <TypeIcon size={11} />
              {typeCfg.label}
            </span>

            {/* Requested date */}
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={11} />
              Requested: {fmt(borrow.borrowDate)}
            </span>
          </div>
        </div>

        {/* Pending badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border text-amber-400 bg-amber-500/10 border-amber-500/20 shrink-0 self-start">
          <Clock size={12} />
          Pending
        </div>
      </div>

      {/* Due date preview */}
      <div className="flex items-center gap-2 bg-white/3 border border-white/5 rounded-xl px-4 py-3 mb-5">
        <Calendar size={14} className="text-slate-500" />
        <span className="text-xs text-slate-500">
          If approved, due date will be set to{' '}
          <span className="text-white font-semibold">{estimatedDue}</span>
          <span className="text-slate-600 ml-1">({dueDays} days)</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          id={`reject-borrow-${borrow.id}`}
          onClick={() => onReject(borrow.id)}
          disabled={isActing}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isActing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
          Reject
        </button>
        <button
          id={`approve-borrow-${borrow.id}`}
          onClick={() => onApprove(borrow.id)}
          disabled={isActing}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isActing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          Approve
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
  const [actionFeedback, setActionFeedback] = useState<{ id: number; type: 'approved' | 'rejected' } | null>(null);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPendingBorrows();
      setBorrows(data);
    } catch (err) {
      console.error('Failed to fetch pending borrows:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id: number) => {
    setActingId(id);
    try {
      await approveBorrow(id);
      setActionFeedback({ id, type: 'approved' });
      setBorrows((prev) => prev.filter((b) => b.id !== id));
      setTimeout(() => setActionFeedback(null), 3000);
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
      setActionFeedback({ id, type: 'rejected' });
      setBorrows((prev) => prev.filter((b) => b.id !== id));
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to reject borrow:', err);
    } finally {
      setActingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['LIBRARIAN', 'ADMIN']}>
        <div className="min-h-screen bg-slate-950 px-6 py-12">
          <div className="max-w-3xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                  <ClipboardList size={24} className="text-amber-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Borrow Requests</h1>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Review and action pending student requests
                  </p>
                </div>
              </div>

              <button
                id="refresh-pending-borrows"
                onClick={fetchPending}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-sm font-medium disabled:opacity-50"
              >
                <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">{borrows.length}</div>
                <div className="text-slate-500 text-xs mt-0.5">Pending Requests</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-slate-300">
                {new Set(borrows.map((b) => b.type)).size}
              </div>
                <div className="text-slate-500 text-xs mt-0.5">Borrow Types</div>
              </div>
            </div>

            {/* Action feedback toast */}
            {actionFeedback && (
              <div
                className={`flex items-center gap-3 rounded-2xl px-5 py-4 mb-6 border animate-in fade-in slide-in-from-top-2 duration-300 ${
                  actionFeedback.type === 'approved'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                {actionFeedback.type === 'approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                <span className="text-sm font-medium">
                  Request #{actionFeedback.id} has been{' '}
                  <strong>{actionFeedback.type}</strong> successfully.
                </span>
              </div>
            )}

            {/* Content */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-slate-500 text-sm">Loading pending requests...</p>
              </div>
            ) : borrows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-white/5 p-5 rounded-full mb-5 border border-white/10">
                  <ClipboardList size={48} className="text-slate-600" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">All caught up!</h2>
                <p className="text-slate-500 text-sm max-w-xs">
                  There are no pending borrow requests at the moment. Check back later.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {borrows.map((borrow) => (
                  <BorrowRequestCard
                    key={borrow.id}
                    borrow={borrow}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isActing={actingId === borrow.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
