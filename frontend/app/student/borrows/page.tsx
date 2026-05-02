'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

import ProtectedRoute from '@/components/ProtectedRoute';
import { getMyBorrows } from '@/lib/api/borrows';
import { Borrow, BorrowStatus } from '@/lib/types/borrow';
import {
  BookOpen, Clock, CheckCircle, XCircle, RefreshCw,
  Loader2, Calendar, Tag, AlertTriangle, BookMarked,
  DollarSign} from 'lucide-react';
import { finesApi } from '@/lib/api/fines';
import { Fine } from '@/lib/types/fine';


// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BorrowStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  [BorrowStatus.PENDING]: {
    label: 'Pending',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: Clock,
  },
  [BorrowStatus.APPROVED]: {
    label: 'Active',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    icon: CheckCircle,
  },
  [BorrowStatus.REJECTED]: {
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: XCircle,
  },
  [BorrowStatus.RETURNED]: {
    label: 'Returned',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: RefreshCw,
  },
};

const TYPE_LABELS: Record<string, string> = {
  BOOK: 'Book',
  MAGAZINE: 'Magazine',
  THESIS: 'Thesis',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (dateStr: string | null) =>
  dateStr ? new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const isOverdue = (dueDate: string | null) =>
  dueDate ? new Date(dueDate) < new Date() : false;

// ─── BorrowRow ────────────────────────────────────────────────────────────────

function BorrowRow({ borrow }: { borrow: Borrow }) {
  const cfg = STATUS_CONFIG[borrow.status];
  const Icon = cfg.icon;
  const overdue = borrow.status === BorrowStatus.APPROVED && isOverdue(borrow.dueDate);

  return (
    <div className="glass-dark rounded-2xl border border-white/5 hover:border-white/10 p-5 transition-all group">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Book icon */}
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <BookOpen size={22} className="text-slate-500 group-hover:text-primary transition-colors" />
        </div>

        {/* Book info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {borrow.book.title}
          </h3>
          <p className="text-slate-500 text-sm mt-0.5">{borrow.book.author}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Tag size={11} />
              {TYPE_LABELS[borrow.type] ?? borrow.type}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              Borrowed: {fmt(borrow.borrowDate)}
            </span>
            {borrow.dueDate && (
              <span className={`flex items-center gap-1 ${overdue ? 'text-red-400 font-semibold' : ''}`}>
                {overdue && <AlertTriangle size={11} />}
                Due: {fmt(borrow.dueDate)}
                {overdue && ' (Overdue!)'}
              </span>
            )}
            {borrow.returnDate && (
              <span className="flex items-center gap-1 text-emerald-500">
                <CheckCircle size={11} />
                Returned: {fmt(borrow.returnDate)}
              </span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0
          ${cfg.color} ${cfg.bg} ${cfg.border}`}
        >
          <Icon size={12} />
          {cfg.label}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'active' | 'past' | 'fines';

export default function StudentBorrowsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('active');

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const [borrowsData, finesData] = await Promise.all([
            getMyBorrows(),
            finesApi.getMyFines()
          ]);
          setBorrows(borrowsData);
          setFines(finesData);
        } catch (err: any) {
          if (err.response?.status !== 401) {
            console.error('Failed to load dashboard data:', err);
          }
        } finally {

          setIsLoading(false);
        }
      })();
    }
  }, [token]);


  const activeBorrows = borrows.filter(
    (b) => b.status === BorrowStatus.PENDING || b.status === BorrowStatus.APPROVED,
  );
  const pastBorrows = borrows.filter(
    (b) => b.status === BorrowStatus.RETURNED || b.status === BorrowStatus.REJECTED,
  );

  const unpaidFines = fines.filter(f => !f.isPaid);
  const totalFines = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

  const displayed = activeTab === 'active' ? activeBorrows : pastBorrows;



  // Count overdue
  const overdueCount = activeBorrows.filter(
    (b) => b.status === BorrowStatus.APPROVED && isOverdue(b.dueDate),
  ).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 px-6 py-12">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-xl">
                <BookMarked size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Borrows</h1>
                <p className="text-slate-500 text-sm mt-0.5">Track all your borrow requests and returns</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: 'Active', value: activeBorrows.length, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
                { label: 'Overdue', value: overdueCount, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                { label: 'Total', value: borrows.length, color: 'text-slate-300', bg: 'bg-white/5', border: 'border-white/10' },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} ${stat.border} border rounded-2xl p-4 text-center`}>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 border border-white/5 p-1 rounded-2xl mb-6">
            {([['active', 'Active'], ['past', 'History'], ['fines', 'Fines']] as const).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${activeTab === tab
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs
                  ${activeTab === tab ? 'bg-primary-foreground/20' : 'bg-white/10'}`}>
                  {tab === 'active' ? activeBorrows.length : tab === 'past' ? pastBorrows.length : fines.length}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-slate-500 text-sm">Loading your dashboard...</p>
            </div>
          ) : activeTab === 'fines' ? (
            <div className="space-y-6">
              {/* Total Owed Card */}
              <div className="glass-dark rounded-2xl border border-white/10 p-6 flex items-center justify-between bg-linear-to-br from-amber-500/5 to-transparent">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium">Total Amount Owed</h3>
                  <div className="text-4xl font-bold text-white mt-1 flex items-baseline gap-1">
                    {totalFines} <span className="text-lg text-slate-500 font-normal">EGP</span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/20">
                  <DollarSign size={32} className="text-amber-400" />
                </div>
              </div>

              {fines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-white/5 p-5 rounded-full mb-5 border border-white/10 text-emerald-500">
                    <CheckCircle size={48} />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">No Fines</h2>
                  <p className="text-slate-500 text-sm">Your account is in good standing!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {fines.map((fine) => (
                    <div key={fine.id} className="glass-dark rounded-2xl border border-white/5 p-5 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${fine.isPaid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                          {fine.isPaid ? <CheckCircle size={20} /> : <DollarSign size={20} />}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{fine.borrow?.book?.title ?? 'Library Fine'}</h4>
                          <p className="text-slate-500 text-xs mt-0.5">
                            Added on {fmt(fine.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${fine.isPaid ? 'text-emerald-400 line-through opacity-50' : 'text-white'}`}>
                          {fine.amount} EGP
                        </div>
                        <div className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${fine.isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {fine.isPaid ? `Paid on ${fmt(fine.paidAt)}` : 'Outstanding'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-white/5 p-5 rounded-full mb-5 border border-white/10">
                <BookOpen size={48} className="text-slate-600" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {activeTab === 'active' ? 'No active borrows' : 'No past borrows'}
              </h2>
              <p className="text-slate-500 text-sm max-w-xs">
                {activeTab === 'active'
                  ? 'Browse the catalog and request a book to get started.'
                  : 'Your returned and rejected borrows will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayed.map((borrow) => (
                <BorrowRow key={borrow.id} borrow={borrow} />
              ))}
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
