'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

import ProtectedRoute from '@/components/ProtectedRoute';
import { getMyBorrows } from '@/lib/api/borrows';
import { finesApi } from '@/lib/api/fines';
import { notificationsApi } from '@/lib/api/notifications';
import { Borrow, BorrowStatus } from '@/lib/types/borrow';
import { Fine } from '@/lib/types/fine';
import { Notification } from '@/lib/types/notification';
import { 
  BookMarked, DollarSign, Bell, 
  ArrowRight, Clock, CheckCircle, AlertTriangle, 
  BookOpen, ChevronRight, TrendingUp, Loader2
} from 'lucide-react';

export default function StudentDashboard() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.response?.status !== 401) {
          console.error('Failed to load dashboard data:', err);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  const activeBorrows = borrows.filter(b => b.status === BorrowStatus.APPROVED);
  const pendingBorrows = borrows.filter(b => b.status === BorrowStatus.PENDING);
  const unpaidFines = fines.filter(f => !f.isPaid);
  const totalOwed = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const isOverdue = (dueDate: string | null) =>
    dueDate ? new Date(dueDate) < new Date() : false;
  const overdueCount = activeBorrows.filter(b => isOverdue(b.dueDate)).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-[#555555]" size={24} />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#000000] px-6 py-12">
        <div className="max-w-6xl mx-auto">
          
          <header className="mb-12">
            <h1 className="text-[36px] font-[800] leading-tight text-white uppercase tracking-tight">Student Dashboard</h1>
            <p className="text-[13px] text-[#555555] mt-1 uppercase tracking-wider">Overview of your academic library activities</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <Link href="/student/borrows" className="bg-[#111111] p-8 rounded-2xl border border-[#222222] hover:border-[#444444] transition-all group">
              <div className="flex justify-between items-start mb-10">
                <div className="text-[10px] text-[#666666] uppercase tracking-[0.2em] font-[600]">ACTIVE BORROWS</div>
                <BookMarked size={16} className="text-[#666666] group-hover:text-white transition-colors" />
              </div>
              <div className="text-[48px] font-[800] text-white leading-none mb-4">{activeBorrows.length}</div>
              <div className="flex items-center justify-between mt-6">
                <p className="text-[12px] text-[#888888]">
                  {overdueCount > 0 ? (
                    <span className="text-white font-[600] flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      {overdueCount} Overdue
                    </span>
                  ) : (
                    <span>All on track</span>
                  )}
                </p>
                <ArrowRight size={14} className="text-[#444444] group-hover:text-white transition-colors" />
              </div>
            </Link>

            <Link href="/student/borrows?tab=fines" className="bg-[#111111] p-8 rounded-2xl border border-[#222222] hover:border-[#444444] transition-all group">
              <div className="flex justify-between items-start mb-10">
                <div className="text-[10px] text-[#666666] uppercase tracking-[0.2em] font-[600]">OUTSTANDING FINES</div>
                <DollarSign size={16} className="text-[#666666] group-hover:text-white transition-colors" />
              </div>
              <div className="text-[48px] font-[800] text-white leading-none mb-4 flex items-baseline gap-2">
                {totalOwed} <span className="text-[14px] text-[#666666] font-[600]">EGP</span>
              </div>
              <div className="flex items-center justify-between mt-6">
                <p className="text-[12px] text-[#888888]">
                  {unpaidFines.length} pending payment{unpaidFines.length !== 1 ? 's' : ''}
                </p>
                <ArrowRight size={14} className="text-[#444444] group-hover:text-white transition-colors" />
              </div>
            </Link>

            <div className="bg-[#111111] p-8 rounded-2xl border border-[#222222] group cursor-default">
              <div className="flex justify-between items-start mb-10">
                <div className="text-[10px] text-[#666666] uppercase tracking-[0.2em] font-[600]">NEW NOTIFICATIONS</div>
                <Bell size={16} className="text-[#666666]" />
              </div>
              <div className="text-[48px] font-[800] text-white leading-none mb-4">{unreadNotifications}</div>
              <div className="flex items-center justify-between mt-6">
                <p className="text-[12px] text-[#888888]">Check your bell icon for alerts</p>
                <TrendingUp size={14} className="text-[#444444]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden h-full">
                <div className="p-6 border-b border-[#222222] flex justify-between items-center bg-[#151515]">
                  <h3 className="text-[13px] font-[800] text-white uppercase tracking-widest flex items-center gap-2">
                    <Clock className="text-[#555555]" size={14} />
                    Pending Requests
                  </h3>
                  <Link href="/student/borrows" className="text-[10px] font-[800] text-[#666666] hover:text-white uppercase tracking-widest transition-colors">
                    See All
                  </Link>
                </div>
                <div className="p-6">
                  {pendingBorrows.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full border border-dashed border-[#333333] flex items-center justify-center mb-6">
                        <CheckCircle size={24} className="text-[#444444]" />
                      </div>
                      <p className="text-[13px] text-[#666666] font-[500] uppercase tracking-widest">No pending requests</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingBorrows.map(b => (
                        <div key={b.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#222222] rounded-xl hover:border-[#333333] transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-black border border-[#333333] flex items-center justify-center text-white">
                              <BookOpen size={16} />
                            </div>
                            <div>
                              <h4 className="text-[14px] text-white font-[600]">{b.book.title}</h4>
                              <p className="text-[11px] text-[#666666] mt-0.5">Requested on {new Date(b.borrowDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-[#444444]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8">
                <h3 className="text-[10px] font-[800] text-[#666666] uppercase tracking-[0.2em] mb-6">Library Tip</h3>
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-white border border-[#333333]">
                    <TrendingUp size={14} />
                  </div>
                  <p className="text-[13px] text-[#888888] leading-relaxed">
                    Returning books 2 days before the due date boosts your internal library rating.
                  </p>
                </div>
                <Link href="/books" className="flex items-center justify-center w-full mt-8 py-3 rounded-lg bg-white hover:bg-[#eeeeee] text-black text-[11px] font-[800] uppercase tracking-widest transition-all">
                  Browse Catalog
                </Link>
              </div>

              <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8">
                <h3 className="text-[10px] font-[800] text-[#666666] uppercase tracking-[0.2em] mb-6">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-[#222222]">
                    <span className="text-[11px] text-[#888888] font-[600] uppercase tracking-wider">Auto-Fine Service</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-[#222222]">
                    <span className="text-[11px] text-[#888888] font-[600] uppercase tracking-wider">Live Notifications</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
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
