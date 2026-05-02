'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getMyBorrows } from '@/lib/api/borrows';
import { finesApi } from '@/lib/api/fines';
import { notificationsApi } from '@/lib/api/notifications';
import { Borrow, BorrowStatus } from '@/lib/types/borrow';
import { Fine } from '@/lib/types/fine';
import { Notification } from '@/lib/types/notification';
import { 
  LayoutDashboard, BookMarked, DollarSign, Bell, 
  ArrowRight, Clock, CheckCircle, AlertTriangle, 
  BookOpen, ChevronRight, TrendingUp
} from 'lucide-react';

export default function StudentDashboard() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [b, f, n] = await Promise.all([
          getMyBorrows(),
          finesApi.getMyFines(),
          notificationsApi.getMyNotifications()
        ]);
        setBorrows(b);
        setFines(f);
        setNotifications(n);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const activeBorrows = borrows.filter(b => b.status === BorrowStatus.APPROVED);
  const pendingBorrows = borrows.filter(b => b.status === BorrowStatus.PENDING);
  const unpaidFines = fines.filter(f => !f.isPaid);
  const totalOwed = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  // Overdue check
  const isOverdue = (dueDate: string | null) =>
    dueDate ? new Date(dueDate) < new Date() : false;
  const overdueCount = activeBorrows.filter(b => isOverdue(b.dueDate)).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Syncing your library data...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-xl text-primary border border-primary/20">
                <LayoutDashboard size={24} />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">Student <span className="text-primary">Dashboard</span></h1>
            </div>
            <p className="text-slate-500 font-medium ml-12">Overview of your academic library activities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Active Borrows Card */}
            <Link href="/student/borrows" className="glass-dark p-8 rounded-3xl border border-white/5 hover:border-primary/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform" />
              <div className="flex justify-between items-start relative mb-6">
                <div className="p-3 bg-primary/20 rounded-2xl text-primary border border-primary/20">
                  <BookMarked size={24} />
                </div>
                <div className="text-4xl font-black text-white">{activeBorrows.length}</div>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Active Borrows</h3>
              <p className="text-slate-500 text-sm flex items-center gap-2">
                {overdueCount > 0 ? (
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {overdueCount} Overdue
                  </span>
                ) : (
                  <span>All on track</span>
                )}
              </p>
              <div className="mt-6 flex items-center gap-2 text-primary font-bold text-sm">
                View Details <ArrowRight size={16} />
              </div>
            </Link>

            {/* Fines Card */}
            <Link href="/student/borrows?tab=fines" className="glass-dark p-8 rounded-3xl border border-white/5 hover:border-amber-500/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform" />
              <div className="flex justify-between items-start relative mb-6">
                <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500 border border-amber-500/20">
                  <DollarSign size={24} />
                </div>
                <div className="text-4xl font-black text-white">{totalOwed} <span className="text-sm font-normal text-slate-500">EGP</span></div>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Outstanding Fines</h3>
              <p className="text-slate-500 text-sm">
                {unpaidFines.length} pending payment{unpaidFines.length !== 1 ? 's' : ''}
              </p>
              <div className="mt-6 flex items-center gap-2 text-amber-500 font-bold text-sm">
                Pay Fines <ArrowRight size={16} />
              </div>
            </Link>

            {/* Notifications Card */}
            <div className="glass-dark p-8 rounded-3xl border border-white/5 hover:border-indigo-500/50 transition-all group relative overflow-hidden cursor-default">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform" />
              <div className="flex justify-between items-start relative mb-6">
                <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 border border-indigo-500/20">
                  <Bell size={24} />
                </div>
                <div className="text-4xl font-black text-white">{unreadNotifications}</div>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">New Notifications</h3>
              <p className="text-slate-500 text-sm">Check your bell icon for alerts</p>
              <div className="mt-6 flex items-center gap-2 text-indigo-400 font-bold text-sm">
                Stay Updated <TrendingUp size={16} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity / Pending Requests */}
            <div className="lg:col-span-2">
              <div className="glass-dark border border-white/5 rounded-[40px] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Clock className="text-slate-500" size={20} />
                    Pending Requests
                  </h3>
                  <Link href="/student/borrows" className="text-primary text-xs font-bold hover:underline uppercase tracking-widest">
                    See All
                  </Link>
                </div>
                <div className="p-8">
                  {pendingBorrows.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle size={48} className="mx-auto text-emerald-500/20 mb-4" />
                      <p className="text-slate-500 font-medium">No pending requests. Happy reading!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingBorrows.map(b => (
                        <div key={b.id} className="flex items-center justify-between p-5 bg-white/2 border border-white/5 rounded-3xl group hover:border-white/10 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                              <BookOpen size={24} />
                            </div>
                            <div>
                              <h4 className="text-white font-bold group-hover:text-amber-500 transition-colors">{b.book.title}</h4>
                              <p className="text-slate-500 text-xs">Requested on {new Date(b.borrowDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-slate-700" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Tips / System Health */}
            <div className="space-y-8">
              <div className="glass-dark border border-white/5 rounded-[40px] p-8 bg-linear-to-br from-primary/10 to-transparent">
                <h3 className="text-lg font-bold text-white mb-6">Library Tip</h3>
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                    <TrendingUp size={20} />
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Returning books 2 days before the due date boosts your internal library rating!
                  </p>
                </div>
                <button className="w-full mt-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all">
                  Browse Catalog
                </button>
              </div>

              <div className="glass-dark border border-white/5 rounded-[40px] p-8">
                <h3 className="text-lg font-bold text-white mb-6">System Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/2 rounded-2xl border border-white/5">
                    <span className="text-xs text-slate-500">Auto-Fine Service</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/2 rounded-2xl border border-white/5">
                    <span className="text-xs text-slate-500">Live Notifications</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
