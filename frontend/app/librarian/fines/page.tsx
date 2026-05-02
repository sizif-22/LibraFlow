'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import AdminLayout from '@/components/AdminLayout';
import { finesApi } from '@/lib/api/fines';
import { Fine } from '@/lib/types/fine';
import { 
  CheckCircle, 
  Loader2, 
  Filter, 
  Download 
} from 'lucide-react';
import FinePaymentModal from '@/components/FinePaymentModal';
import SuccessToast from '@/components/SuccessToast';

export default function LibrarianFinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchFines();
    }
  }, [token]);

  const fetchFines = async () => {
    setIsLoading(true);
    try {
      const data = await finesApi.getAllFines();
      setFines(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('Failed to fetch fines:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['LIBRARIAN', 'ADMIN']}>
        <AdminLayout showSearch={true} searchPlaceholder="Search archive database...">
          <header className="mb-10">
            <h1 className="text-[36px] font-[800] text-white leading-tight">Fines Management</h1>
            <p className="text-[14px] text-[#888888] mt-2">Oversee administrative penalties and academic resource reconciliations.</p>
          </header>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[32px]">
              <div className="text-[10px] text-[#666666] uppercase tracking-[0.2em] mb-5 font-[600]">UNPAID FINES</div>
              <div className="flex items-baseline">
                <span className="text-[52px] font-[800] text-white leading-none">124</span>
                <span className="text-[11px] text-[#555555] uppercase font-[600] ml-3">ACCOUNTS</span>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[32px]">
              <div className="text-[10px] text-[#666666] uppercase tracking-[0.2em] mb-5 font-[600]">TOTAL COLLECTED</div>
              <div className="flex items-baseline">
                <span className="text-[52px] font-[800] text-white leading-none">$4,892</span>
                <span className="text-[11px] text-[#555555] uppercase font-[600] ml-3">FISCAL YEAR</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs Row */}
          <div className="flex justify-between items-center border-b border-[#222222] pb-0 mb-12">
            <div className="flex items-center gap-2">
              <button className="bg-white text-black text-[11px] font-[600] uppercase rounded-[20px] px-[18px] py-[6px] tracking-wide mb-[-1px]">
                ALL OUTSTANDING
              </button>
              <button className="text-[#666666] text-[11px] font-[600] uppercase px-[18px] py-[6px] tracking-wide hover:text-white transition-all">
                OVERDUE (&gt;30 DAYS)
              </button>
              <button className="text-[#666666] text-[11px] font-[600] uppercase px-[18px] py-[6px] tracking-wide hover:text-white transition-all">
                RECONCILIATION PENDING
              </button>
            </div>
            <div className="flex items-center gap-4 text-[#555555] pb-2">
              <Filter size={16} className="cursor-pointer hover:text-white transition-all" />
              <Download size={16} className="cursor-pointer hover:text-white transition-all" />
            </div>
          </div>

          {/* Main Content / Empty State */}
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {isLoading ? (
              <Loader2 className="animate-spin text-white" size={40} />
            ) : (
              <>
                <div className="w-[100px] h-[100px] border-2 border-dashed border-[#333333] rounded-full flex items-center justify-center mb-8">
                  <CheckCircle size={56} className="text-[#333333]" />
                </div>
                <h2 className="text-[28px] font-[800] text-white mb-4">All Fines Settled</h2>
                <p className="text-[14px] text-[#666666] max-w-[420px] leading-relaxed mb-10">
                  Great job! There are no outstanding fines to display. The archive&apos;s fiscal records are currently balanced.
                </p>
                <div className="flex gap-4">
                  <button className="bg-transparent border border-[#444444] text-white text-[12px] font-[600] uppercase rounded-[6px] px-[24px] py-[10px] hover:border-[#666666] transition-all">
                    VIEW HISTORY
                  </button>
                  <button className="bg-white text-black text-[12px] font-[600] uppercase rounded-[6px] px-[24px] py-[10px] hover:bg-[#eeeeee] transition-all">
                    GENERATE REPORT
                  </button>
                </div>
              </>
            )}
          </div>
        </AdminLayout>

        {selectedFine && (
          <FinePaymentModal 
            fine={selectedFine} 
            onClose={() => setSelectedFine(null)} 
            onSuccess={() => {
              fetchFines();
              setShowSuccess(true);
            }} 
          />
        )}

        {showSuccess && (
          <SuccessToast 
            message="Fine payment recorded successfully!" 
            onClose={() => setShowSuccess(false)} 
          />
        )}
      </RoleGuard>
    </ProtectedRoute>
  );
}

