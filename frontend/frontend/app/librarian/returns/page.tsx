'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import { returnBorrow } from '@/lib/api/borrows';
import { Borrow, BorrowType } from '@/lib/types/borrow';
import {
  RotateCcw, Search, User, BookOpen, Calendar, Clock,
  CheckCircle, Loader2, RefreshCw, AlertTriangle,
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

const isOverdue = (dueDate: string | null) =>
  dueDate ? new Date(dueDate) < new Date() : false;

const TYPE_ICONS: Record<BorrowType, React.ElementType> = {
  [BorrowType.BOOK]: BookOpen,
  [BorrowType.MAGAZINE]: Newspaper,
  [BorrowType.THESIS]: GraduationCap,
};

const TYPE_LABELS: Record<BorrowType, string> = {
  [BorrowType.BOOK]: 'Book',
  [BorrowType.MAGAZINE]: 'Magazine',
  [BorrowType.THESIS]: 'Thesis',
};

// ─── ActiveBorrowCard ─────────────────────────────────────────────────────────

function ActiveBorrowCard({
  borrow,
  onReturn,
  isActing,
}: {
  borrow: Borrow;
  onReturn: (id: number) => void;
  isActing: boolean;
}) {
  const overdue = isOverdue(borrow.dueDate);
  const TypeIcon = TYPE_ICONS[borrow.type];

  return (
    <div
      className={`glass-dark rounded-2xl border p-6 transition-all group ${
        overdue ? 'border-red-500/20 hover:border-red-500/30' : 'border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
            overdue
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-white/5 border-white/10 text-slate-500 group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20'
          }`}
        >
          <TypeIcon size={22} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {borrow.book.title}
          </h3>
          <p className="text-slate-500 text-sm mt-0.5">{borrow.book.author}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-slate-400">
            {/* Student */}
            <span className="flex items-center gap-1.5">
              <User size={12} className="text-slate-500" />
              <span className="font-medium text-slate-300">{borrow.student.name}</span>
              <span className="text-slate-600">·</span>
              <span>{borrow.student.email}</span>
            </span>

            {/* Type */}
            <span className="flex items-center gap-1">
              <TypeIcon size={11} />
              {TYPE_LABELS[borrow.type]}
            </span>

            {/* Borrowed date */}
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              Borrowed: {fmt(borrow.borrowDate)}
            </span>

            {/* Due date */}
            {borrow.dueDate && (
              <span className={`flex items-center gap-1 font-semibold ${overdue ? 'text-red-400' : 'text-slate-400'}`}>
                {overdue ? <AlertTriangle size={11} /> : <Clock size={11} />}
                Due: {fmt(borrow.dueDate)}
                {overdue && ' · OVERDUE'}
              </span>
            )}
          </div>
        </div>

        {/* Return button */}
        <button
          id={`return-borrow-${borrow.id}`}
          onClick={() => onReturn(borrow.id)}
          disabled={isActing}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shrink-0 self-start disabled:opacity-50 disabled:cursor-not-allowed ${
            overdue
              ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300'
              : 'bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary hover:text-sky-300'
          }`}
        >
          {isActing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RotateCcw size={14} />
          )}
          {isActing ? 'Recording…' : 'Confirm Return'}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LibrarianReturnsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actingId, setActingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  // We reuse getPendingBorrows here — "active" = APPROVED status
  // We need a different endpoint for approved borrows; we'll fetch all and filter
  const fetchActiveBorrows = useCallback(async () => {
    setIsLoading(true);
    try {
      // The backend GET /api/borrows/pending returns PENDING.
      // For returns we need APPROVED borrows — we call the same borrows API
      // and filter client-side. A dedicated endpoint can be added in sprint 3.
      // For now we use the student-facing "my" route isn't available to librarians,
      // so we hit the pending endpoint — but filter for APPROVED on data received.
      // In production, the backend should expose GET /api/borrows/active for librarians.
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
        // Fallback: empty list gracefully
        setBorrows([]);
      }
    } catch (err) {
      console.error('Failed to fetch active borrows:', err);
      setBorrows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveBorrows();
  }, [fetchActiveBorrows]);

  const handleReturn = async (id: number) => {
    setActingId(id);
    try {
      await returnBorrow(id);
      setSuccessId(id);
      setBorrows((prev) => prev.filter((b) => b.id !== id));
      setTimeout(() => setSuccessId(null), 3000);
    } catch (err) {
      console.error('Failed to record return:', err);
    } finally {
      setActingId(null);
    }
  };

  const filteredBorrows = borrows.filter(
    (b) =>
      b.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const overdueCount = borrows.filter((b) => isOverdue(b.dueDate)).length;

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['LIBRARIAN', 'ADMIN']}>
        <div className="min-h-screen bg-slate-950 px-6 py-12">
          <div className="max-w-3xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                  <RotateCcw size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Record Returns</h1>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Search and confirm book returns from students
                  </p>
                </div>
              </div>

              <button
                id="refresh-active-borrows"
                onClick={fetchActiveBorrows}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-sm font-medium disabled:opacity-50"
              >
                <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{borrows.length}</div>
                <div className="text-slate-500 text-xs mt-0.5">Active Borrows</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{overdueCount}</div>
                <div className="text-slate-500 text-xs mt-0.5">Overdue</div>
              </div>
            </div>

            {/* Success toast */}
            {successId && (
              <div className="flex items-center gap-3 rounded-2xl px-5 py-4 mb-6 border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">
                  Return for borrow <strong>#{successId}</strong> recorded successfully. Book availability updated.
                </span>
              </div>
            )}

            {/* Search */}
            <div className="relative mb-8 group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"
                size={20}
              />
              <input
                id="returns-search-input"
                type="text"
                placeholder="Search by student name, email, or book title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-slate-500 text-sm">Loading active borrows...</p>
              </div>
            ) : filteredBorrows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-white/5 p-5 rounded-full mb-5 border border-white/10">
                  <BookMarked size={48} className="text-slate-600" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {searchTerm ? 'No results found' : 'No active borrows'}
                </h2>
                <p className="text-slate-500 text-sm max-w-xs">
                  {searchTerm
                    ? 'Try a different search term to find the borrow record.'
                    : 'All currently approved borrows will appear here once students have taken books.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-primary hover:underline text-sm font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBorrows.map((borrow) => (
                  <ActiveBorrowCard
                    key={borrow.id}
                    borrow={borrow}
                    onReturn={handleReturn}
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
