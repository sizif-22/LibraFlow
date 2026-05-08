/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
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
  FileText, 
  RefreshCcw, 
  Bell, 
  DollarSign,
  ChevronRight
} from 'lucide-react';
import api from '@/lib/api';

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

        const bData = borrows.data as any;
        const fData = fines.data as any;
        const bkData = books.data as any;

        const borrowData = bData.borrows || bData;
        const fineData = fData.fines || fData;
        const bookData = bkData.books || bkData;

        setStats({
          pendingBorrows: Array.isArray(borrowData) ? borrowData.filter((b: any) => b.status === 'PENDING').length : 0,
          overdueReturns: Array.isArray(borrowData) ? borrowData.filter((b: any) => b.status === 'APPROVED' && b.dueDate && new Date(b.dueDate) < new Date()).length : 0,
          unpaidFines: Array.isArray(fineData) ? fineData.filter((f: any) => !f.isPaid).length : 0,
          totalBooks: bkData.pagination?.total || (Array.isArray(bookData) ? bookData.length : 0)
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

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['LIBRARIAN', 'ADMIN']}>
        <AdminLayout showSearch={true} searchPlaceholder="Global Archive Search">
          <header className="mb-10">
            <h1 className="text-[36px] font-[800] leading-tight flex items-baseline">
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
                <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-[500]">ARCHIVE CAP</span>
              </div>
              <div className="text-[40px] font-[800] text-white mt-3 leading-none">42.8k</div>
              <div className="text-[11px] text-[#555555] mt-2 uppercase tracking-wide">Total Volumes Listed</div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[24px]">
              <div className="flex justify-between items-start">
                <ArrowLeftRight size={18} className="text-[#555555]" />
                <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-[500]">ACTIVE FLOW</span>
              </div>
              <div className="text-[40px] font-[800] text-white mt-3 leading-none">1,204</div>
              <div className="text-[11px] text-[#555555] mt-2 uppercase tracking-wide">Current Borrows</div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[24px]">
              <div className="flex justify-between items-start">
                <AlertTriangle size={18} className="text-[#555555]" />
                <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-[500]">ESCALATIONS</span>
              </div>
              <div className="text-[40px] font-[800] text-white mt-3 leading-none">82</div>
              <div className="text-[11px] text-[#555555] mt-2 uppercase tracking-wide">Overdue Returns</div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[24px]">
              <div className="flex justify-between items-start">
                <Users size={18} className="text-[#555555]" />
                <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-[500]">ENGAGEMENT</span>
              </div>
              <div className="text-[40px] font-[800] text-white mt-3 leading-none">3.5k</div>
              <div className="text-[11px] text-[#555555] mt-2 uppercase tracking-wide">Verified Members</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
            {/* Rapid Command Center */}
            <div>
              <h3 className="text-[10px] text-[#555555] uppercase tracking-[0.2em] font-[600] mb-4">RAPID COMMAND CENTER</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Ingest Assets', icon: Upload },
                  { label: 'Verify Users', icon: UserCheck },
                  { label: 'Batch Manifest', icon: FileText },
                  { label: 'Inventory Sync', icon: RefreshCcw },
                  { label: 'Dispatch Alerts', icon: Bell },
                  { label: 'Settlements', icon: DollarSign },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <div key={action.label} className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[28px] flex flex-col items-center justify-center cursor-pointer hover:border-[#444444] transition-all group">
                      <Icon size={24} className="text-[#888888] mb-4 group-hover:text-white transition-all" />
                      <span className="text-[13px] font-[600] text-white text-center">{action.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Insights Panel */}
            <div>
              <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[28px]">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-[10px] text-[#555555] uppercase tracking-[0.2em] font-[600]">DAILY INSIGHTS</span>
                  <span className="text-[9px] text-[#555555] bg-[#222222] border-radius-[4px] px-[6px] py-[2px] rounded-[4px] uppercase tracking-tighter">LIVE</span>
                </div>

                <div className="space-y-0">
                  {[
                    { label: 'Total Requests', value: '242' },
                    { label: 'Successful Returns', value: '188' },
                    { label: 'System Uptime', value: '99.98%' },
                    { label: 'Archive Growth', value: '+12 vols' },
                  ].map((metric) => (
                    <div key={metric.label} className="flex justify-between items-center py-4 border-b border-[#1f1f1f]">
                      <span className="text-[13px] text-[#888888]">{metric.label}</span>
                      <span className="text-[13px] text-white font-[600]">{metric.value}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full bg-white text-black text-[13px] font-[600] rounded-[6px] h-[48px] mt-10 hover:bg-[#eeeeee] transition-all flex items-center justify-center gap-2 uppercase tracking-wide">
                  Full System Reports <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

