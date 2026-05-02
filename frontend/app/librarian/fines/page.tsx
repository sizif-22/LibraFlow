'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import { finesApi } from '@/lib/api/fines';
import { Fine } from '@/lib/types/fine';
import { 
  DollarSign, Search, CheckCircle, Clock, 
  Loader2, User, BookOpen, AlertCircle
} from 'lucide-react';
import FinePaymentModal from '@/components/FinePaymentModal';
import SuccessToast from '@/components/SuccessToast';

export default function LibrarianFinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    setIsLoading(true);
    try {
      const data = await finesApi.getAllFines();
      setFines(data);
    } catch (err) {
      console.error('Failed to fetch fines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFines = fines.filter(fine => {
    const matchesSearch = 
      fine.borrow?.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.borrow?.student?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.borrow?.book?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'PAID' && fine.isPaid) ||
      (statusFilter === 'UNPAID' && !fine.isPaid);
      
    return matchesSearch && matchesStatus;
  });

  const unpaidCount = fines.filter(f => !f.isPaid).length;
  const totalRevenue = fines.filter(f => f.isPaid).reduce((sum, f) => sum + f.amount, 0);

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['LIBRARIAN', 'ADMIN']}>
        <div className="min-h-screen bg-slate-950 px-6 py-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-amber-500">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Fines Management</h1>
                    <p className="text-slate-500 text-sm mt-0.5">View and record student fine payments</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="glass-dark border border-white/5 rounded-2xl p-4 min-w-[160px]">
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Unpaid Fines</p>
                  <div className="text-2xl font-bold text-amber-400">{unpaidCount}</div>
                </div>
                <div className="glass-dark border border-white/5 rounded-2xl p-4 min-w-[160px]">
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total Collected</p>
                  <div className="text-2xl font-bold text-emerald-400">{totalRevenue} EGP</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="glass-dark border border-white/5 rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Search by student or book..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                {(['ALL', 'UNPAID', 'PAID'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all
                      ${statusFilter === status 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="glass-dark border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              {isLoading ? (
                <div className="py-24 flex flex-col items-center gap-4">
                  <Loader2 size={40} className="animate-spin text-primary" />
                  <p className="text-slate-500">Loading fine records...</p>
                </div>
              ) : filteredFines.length === 0 ? (
                <div className="py-24 text-center">
                  <AlertCircle size={48} className="mx-auto text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-1">No fines found</h3>
                  <p className="text-slate-500">Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="px-6 py-4 text-slate-400 font-medium text-sm">Student</th>
                        <th className="px-6 py-4 text-slate-400 font-medium text-sm">Book</th>
                        <th className="px-6 py-4 text-slate-400 font-medium text-sm text-center">Amount</th>
                        <th className="px-6 py-4 text-slate-400 font-medium text-sm text-center">Status</th>
                        <th className="px-6 py-4 text-slate-400 font-medium text-sm text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredFines.map((fine) => (
                        <tr key={fine.id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <User size={16} />
                              </div>
                              <div>
                                <div className="text-white font-semibold">{fine.borrow?.student?.name}</div>
                                <div className="text-slate-500 text-xs">{fine.borrow?.student?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <BookOpen size={16} className="text-slate-500" />
                              <div className="text-slate-300 max-w-[200px] truncate">{fine.borrow?.book?.title}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="text-white font-mono font-bold">{fine.amount} EGP</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-center">
                              {fine.isPaid ? (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                  <CheckCircle size={10} />
                                  Paid
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                                  <Clock size={10} />
                                  Unpaid
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {!fine.isPaid ? (
                              <button
                                onClick={() => setSelectedFine(fine)}
                                className="bg-primary hover:bg-sky-400 text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-sky-500/10"
                              >
                                Record Payment
                              </button>
                            ) : (
                              <span className="text-slate-500 text-[10px] font-medium">
                                Paid on {new Date(fine.paidAt!).toLocaleDateString()}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

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
