/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import AdminLayout from '@/components/AdminLayout';
import { 
  Book, 
  ArrowLeftRight, 
  AlertTriangle, 
  Users, 
  Upload, 
  UserCheck, 
  RefreshCcw, 
  DollarSign,
  ChevronRight,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';

export default function LibrarianDashboard() {
  const [stats, setStats] = useState({
    pendingBorrows: 0,
    activeBorrows: 0,
    overdueReturns: 0,
    unpaidFines: 0,
    totalBooks: 0,
    totalUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users')
        ]);

        const s = statsRes.data as any;
        const uData = usersRes.data as any || [];

        setStats({
          pendingBorrows: s.pendingBorrows,
          activeBorrows: s.onLoan, // onLoan represents active borrows
          overdueReturns: s.overdueBooks,
          unpaidFines: 0, // Need to add to stats if possible, or keep as is
          totalBooks: s.totalBooks,
          totalUsers: uData.length
        });
      } catch (err: any) {
        console.error('Failed to load librarian stats:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['LIBRARIAN', 'ADMIN']}>
        <AdminLayout showSearch={true} searchPlaceholder="Global Archive Search">
          <header className="mb-10">
            <h1 className="text-[36px] font-extrabold leading-tight flex items-baseline">
              <span className="text-white">Librarian</span>
              <span className="text-[#888888] ml-2">Command</span>
            </h1>
            <p className="text-[13px] text-[#555555] mt-1 uppercase tracking-wider">System Administrative Overview</p>
          </header>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[24px]">
              <div className="flex justify-between items-start">
                <Book size={18} className="text-[#555555]" />
                <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-medium">ARCHIVE CAP</span>
              </div>
              <div className="text-[40px] font-extrabold text-white mt-3 leading-none">
                {stats.totalBooks.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#555555] mt-2 uppercase tracking-wide">Total Volumes Listed</div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[24px]">
              <div className="flex justify-between items-start">
                <ArrowLeftRight size={18} className="text-[#555555]" />
                <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-medium">ACTIVE FLOW</span>
              </div>
              <div className="text-[40px] font-extrabold text-white mt-3 leading-none">
                {stats.activeBorrows.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#555555] mt-2 uppercase tracking-wide">Current Borrows</div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[24px]">
              <div className="flex justify-between items-start">
                <AlertTriangle size={18} className="text-[#f87171]" />
                <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-medium">ESCALATIONS</span>
              </div>
              <div className="text-[40px] font-extrabold text-[#f87171] mt-3 leading-none">
                {stats.overdueReturns}
              </div>
              <div className="text-[11px] text-[#555555] mt-2 uppercase tracking-wide">Overdue Returns</div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[24px]">
              <div className="flex justify-between items-start">
                <Users size={18} className="text-[#555555]" />
                <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-medium">ENGAGEMENT</span>
              </div>
              <div className="text-[40px] font-extrabold text-white mt-3 leading-none">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#555555] mt-2 uppercase tracking-wide">System Members</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
            {/* Rapid Command Center */}
            <div>
              <h3 className="text-[10px] text-[#555555] uppercase tracking-[0.2em] font-semibold mb-4">RAPID COMMAND CENTER</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Ingest Assets', icon: Upload, path: '/librarian/books' },
                  { label: 'Verify Requests', icon: UserCheck, path: '/librarian/borrows' },
                  { label: 'Manage Returns', icon: RefreshCcw, path: '/librarian/returns' },
                  { label: 'Process Fines', icon: DollarSign, path: '/librarian/fines' },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <div 
                      key={action.label} 
                      onClick={() => action.path !== '#' && router.push(action.path)}
                      className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[28px] flex flex-col items-center justify-center cursor-pointer hover:border-[#444444] transition-all group active:scale-95"
                    >
                      <Icon size={24} className="text-[#888888] mb-4 group-hover:text-white transition-all" />
                      <span className="text-[13px] font-semibold text-white text-center">{action.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Insights Panel */}
            <div>
              <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[28px]">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-[10px] text-[#555555] uppercase tracking-[0.2em] font-semibold">LIVE INSIGHTS</span>
                  <span className="text-[9px] text-[#4ade80] bg-[#064e3b] px-[6px] py-[2px] rounded-[4px] uppercase tracking-tighter font-bold">ACTIVE</span>
                </div>

                <div className="space-y-0">
                  {[
                    { label: 'Pending Approvals', value: stats.pendingBorrows },
                    { label: 'Unpaid Fines', value: stats.unpaidFines },
                    { label: 'Overdue Books', value: stats.overdueReturns },
                    { label: 'System Status', value: 'ONLINE' },
                  ].map((metric) => (
                    <div key={metric.label} className="flex justify-between items-center py-4 border-b border-[#1f1f1f]">
                      <span className="text-[13px] text-[#888888]">{metric.label}</span>
                      <span className={`text-[13px] font-semibold ${metric.label === 'System Status' ? 'text-[#4ade80]' : 'text-white'}`}>
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => router.push('/librarian/borrows')}
                  className="w-full bg-white text-black text-[13px] font-semibold rounded-[6px] h-[48px] mt-10 hover:bg-[#eeeeee] transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  Process Requests <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

