'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

import ProtectedRoute from '@/components/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import api from '@/lib/api';
import { 
  LayoutDashboard, ClipboardList, RotateCcw, DollarSign,
  ArrowRight, Users, BookOpen, 
  BarChart3, Settings, ChevronRight
} from 'lucide-react';

import { Borrow } from '@/lib/types/borrow';
import { Fine } from '@/lib/types/fine';

export default function LibrarianDashboard() {
  const [stats, setStats] = useState({
    pendingBorrows: 0,
    overdueReturns: 0,
    unpaidFines: 0,
    totalBooks: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [borrows, fines, books] = await Promise.all([
          api.get('/borrows'),
          api.get('/fines'),
          api.get('/books')
        ]);

        const borrowData = borrows.data.borrows || borrows.data;
        const fineData = fines.data.fines || fines.data;
        const bookData = books.data.books || books.data;

        setStats({
          pendingBorrows: Array.isArray(borrowData) ? borrowData.filter((b: any) => b.status === 'PENDING').length : 0,
          overdueReturns: Array.isArray(borrowData) ? borrowData.filter((b: any) => b.status === 'APPROVED' && b.dueDate && new Date(b.dueDate) < new Date()).length : 0,
          unpaidFines: Array.isArray(fineData) ? fineData.filter((f: any) => !f.isPaid).length : 0,
          totalBooks: books.data.pagination?.total || (Array.isArray(bookData) ? bookData.length : 0)
        });

      } catch (err: any) {
        if (err.response?.status !== 401) {
          console.error('Failed to load librarian stats:', err);
        }
      } finally {

        setIsLoading(false);
      }
    })();
  }, [token]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Gathering library analytics...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['LIBRARIAN', 'ADMIN']}>
        <div className="min-h-screen bg-slate-950 px-6 py-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500 border border-emerald-500/20">
                  <LayoutDashboard size={24} />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight">Librarian <span className="text-emerald-500">Command</span></h1>
              </div>
              <p className="text-slate-500 font-medium ml-12">System-wide circulation & fine management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {/* Stat Cards */}
              <Link href="/librarian/borrows" className="glass-dark p-6 rounded-3xl border border-white/5 hover:border-sky-500/50 transition-all group">
                <div className="p-3 bg-sky-500/20 rounded-2xl text-sky-400 border border-sky-500/20 mb-4 w-fit">
                  <ClipboardList size={20} />
                </div>
                <div className="text-3xl font-black text-white mb-1">{stats.pendingBorrows}</div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Pending Requests</p>
              </Link>

              <Link href="/librarian/returns" className="glass-dark p-6 rounded-3xl border border-white/5 hover:border-red-500/50 transition-all group">
                <div className="p-3 bg-red-500/20 rounded-2xl text-red-400 border border-red-500/20 mb-4 w-fit">
                  <RotateCcw size={20} />
                </div>
                <div className="text-3xl font-black text-white mb-1">{stats.overdueReturns}</div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Overdue Items</p>
              </Link>

              <Link href="/librarian/fines" className="glass-dark p-6 rounded-3xl border border-white/5 hover:border-amber-500/50 transition-all group">
                <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500 border border-amber-500/20 mb-4 w-fit">
                  <DollarSign size={20} />
                </div>
                <div className="text-3xl font-black text-white mb-1">{stats.unpaidFines}</div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Unpaid Fines</p>
              </Link>

              <div className="glass-dark p-6 rounded-3xl border border-white/5 cursor-default">
                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/20 mb-4 w-fit">
                  <BookOpen size={20} />
                </div>
                <div className="text-3xl font-black text-white mb-1">{stats.totalBooks}</div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Books in Catalog</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="glass-dark border border-white/5 rounded-[40px] p-8">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <Settings className="text-slate-500" size={20} />
                  Rapid Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/librarian/books" className="p-6 bg-white/2 border border-white/5 rounded-3xl hover:bg-white/5 transition-all text-center group">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <BookOpen size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-300">Update Catalog</span>
                  </Link>
                  <Link href="/librarian/fines" className="p-6 bg-white/2 border border-white/5 rounded-3xl hover:bg-white/5 transition-all text-center group">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <DollarSign size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-300">Review Fines</span>
                  </Link>
                </div>
              </div>

              {/* Reports Preview */}
              <div className="glass-dark border border-white/5 rounded-[40px] p-8 bg-linear-to-br from-emerald-500/5 to-transparent">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <BarChart3 className="text-emerald-500" size={20} />
                  Daily Insights
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-white/2 border border-white/5 rounded-3xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
                        <Users size={18} />
                      </div>
                      <span className="text-slate-400 text-sm font-medium">New Student Registrations</span>
                    </div>
                    <span className="text-white font-black">+4</span>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-white/2 border border-white/5 rounded-3xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <ArrowRight size={18} />
                      </div>
                      <span className="text-slate-400 text-sm font-medium">Borrow Velocity</span>
                    </div>
                    <span className="text-emerald-400 font-black">High</span>
                  </div>
                </div>
                <Link href="/admin/dashboard" className="w-full mt-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-black transition-all flex items-center justify-center gap-2">
                  Full System Reports
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
