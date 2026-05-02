'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getMyBorrows } from '@/lib/api/borrows';
import { Borrow, BorrowStatus } from '@/lib/types/borrow';
import { Loader2, MoreVertical, Info, XCircle, Filter } from 'lucide-react';
import { finesApi } from '@/lib/api/fines';
import { Fine } from '@/lib/types/fine';
import Footer from '@/components/Footer';

const fmt = (dateStr: string | null) =>
  dateStr ? new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function StudentBorrowsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const activeCount = borrows.filter(b => b.status === BorrowStatus.APPROVED || b.status === BorrowStatus.PENDING).length;
  const overdueCount = borrows.filter(b => b.status === BorrowStatus.APPROVED && new Date(b.dueDate!) < new Date()).length;

  const filteredBorrows = borrows.filter(b => {
    const matchesSearch = b.book.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === 'ACTIVE') return matchesSearch && (b.status === BorrowStatus.APPROVED || b.status === BorrowStatus.PENDING);
    if (activeFilter === 'ARCHIVED') return matchesSearch && (b.status === BorrowStatus.RETURNED || b.status === BorrowStatus.REJECTED);
    return matchesSearch;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#000000] flex flex-col">
        <div className="flex-1 px-10 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-12">
              <h1 className="text-[48px] font-extrabold text-white leading-tight">My Borrows</h1>
              <p className="text-[15px] text-[#888888] mt-2">Tracking your academic literature requests and active loans.</p>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <div className="bg-[#111111] border border-[#222222] rounded-[12px] p-[24px] px-[28px]">
                <span className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-[500]">ACTIVE LOANS</span>
                <div className="text-[48px] font-extrabold text-white mt-1 tabular-nums">
                  {activeCount.toString().padStart(2, '0')}
                </div>
              </div>
              <div className="bg-[#111111] border border-[#222222] rounded-[12px] p-[24px] px-[28px]">
                <span className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-[500]">PENDING REQUESTS</span>
                <div className="text-[48px] font-[800] text-white mt-1 tabular-nums">
                  {borrows.filter(b => b.status === BorrowStatus.PENDING).length.toString().padStart(2, '0')}
                </div>
              </div>
              <div className="bg-[#111111] border border-[#222222] rounded-[12px] p-[24px] px-[28px]">
                <span className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-[500]">OVERDUE PENALTIES</span>
                <div className="text-[48px] font-[800] text-white mt-1 tabular-nums">
                  {overdueCount.toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* Filter + Search Row */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setActiveFilter('ALL')}
                  className={`text-[12px] uppercase tracking-wider font-[600] px-5 py-2 rounded-full transition-all ${
                    activeFilter === 'ALL' ? 'bg-white text-black' : 'text-[#666666] hover:text-white'
                  }`}
                >
                  ALL RECORDS
                </button>
                <button 
                  onClick={() => setActiveFilter('ACTIVE')}
                  className={`text-[12px] uppercase tracking-wider font-[600] transition-all ${
                    activeFilter === 'ACTIVE' ? 'text-white' : 'text-[#666666] hover:text-white'
                  }`}
                >
                  ACTIVE
                </button>
                <button 
                  onClick={() => setActiveFilter('ARCHIVED')}
                  className={`text-[12px] uppercase tracking-wider font-[600] transition-all ${
                    activeFilter === 'ARCHIVED' ? 'text-white' : 'text-[#666666] hover:text-white'
                  }`}
                >
                  ARCHIVED
                </button>
              </div>

              <div className="relative w-[280px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444444]" size={14} />
                <input
                  type="text"
                  placeholder="SEARCH ARCHIVE..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-[36px] bg-[#111111] border border-[#2a2a2a] rounded-[6px] pl-10 pr-4 text-white text-[12px] placeholder:text-[#444444] focus:outline-none focus:border-[#444444] uppercase tracking-wider"
                />
              </div>
            </div>

            {/* Borrows Table */}
            <div className="w-full">
              <div className="grid grid-cols-[1fr_150px_150px_120px_60px] pb-4 border-b border-[#222222] text-[11px] text-[#555555] uppercase tracking-widest font-[600]">
                <div>DOCUMENT TITLE</div>
                <div>REQUEST DATE</div>
                <div>DUE DATE</div>
                <div>STATUS</div>
                <div className="text-right">ACTIONS</div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-white" size={32} />
                </div>
              ) : filteredBorrows.length === 0 ? (
                <div className="py-20 text-center text-[#555555] uppercase tracking-widest text-[12px]">
                  No records found in archive.
                </div>
              ) : (
                <div className="divide-y divide-[#1a1a1a]">
                  {filteredBorrows.map((borrow) => {
                    const isRejected = borrow.status === BorrowStatus.REJECTED;
                    const isPending = borrow.status === BorrowStatus.PENDING;
                    const isApproved = borrow.status === BorrowStatus.APPROVED;
                    
                    return (
                      <div key={borrow.id} className="grid grid-cols-[1fr_150px_150px_120px_60px] py-6 items-center">
                        <div>
                          <div className={`text-[16px] font-[500] ${isRejected ? 'text-[#444444] line-through' : 'text-white'}`}>
                            {borrow.book.title}
                          </div>
                          <div className="text-[12px] text-[#555555] mt-0.5">Call No: {borrow.book.isbn}</div>
                        </div>
                        <div className="text-[14px] text-[#888888]">{fmt(borrow.borrowDate)}</div>
                        <div className="text-[14px] text-[#888888]">
                          {isPending ? <span className="text-[#555555]">Processing...</span> : isRejected ? <span className="text-[#555555]">——</span> : fmt(borrow.dueDate)}
                        </div>
                        <div>
                          <span className={`text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-[4px] border font-[600] ${
                            isApproved ? 'border-white text-white' : 
                            isPending ? 'border-[#555555] text-white' : 
                            'border-[#333333] text-[#555555]'
                          }`}>
                            {borrow.status}
                          </span>
                        </div>
                        <div className="flex justify-end">
                          {isRejected ? (
                            <Info size={18} className="text-[#444444] cursor-pointer" />
                          ) : isPending ? (
                            <XCircle size={18} className="text-[#555555] cursor-pointer" />
                          ) : (
                            <MoreVertical size={18} className="text-[#666666] cursor-pointer" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex items-center justify-between">
              <span className="text-[11px] text-[#444444] uppercase tracking-widest font-[600]">
                SHOWING 1-{filteredBorrows.length} OF {filteredBorrows.length} RECORDS
              </span>
              <div className="flex gap-6 text-[13px] text-[#888888] font-medium">
                <button className="hover:text-white transition-colors">Previous</button>
                <button className="hover:text-white transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

