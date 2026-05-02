'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

import ProtectedRoute from '@/components/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import { adminApi } from '@/lib/api/admin';
import { User, TopBookReport, OverdueBorrowReport, FineReport } from '@/lib/types/admin';
import { 
  Users, Clock, DollarSign, 
  Settings, Shield, UserCheck, UserX,
  TrendingUp, AlertTriangle, Loader2, ArrowRight
} from 'lucide-react';
import SuccessToast from '@/components/SuccessToast';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [topBooks, setTopBooks] = useState<TopBookReport[]>([]);
  const [overdueBorrows, setOverdueBorrows] = useState<OverdueBorrowReport[]>([]);
  const [fineReport, setFineReport] = useState<FineReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [u, tb, ob, fr] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getTopBooksReport(),
        adminApi.getOverdueBorrowsReport(),
        adminApi.getFinesReport(),
      ]);
      setUsers(u);
      setTopBooks(tb);
      setOverdueBorrows(ob);
      setFineReport(fr);
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('Failed to fetch admin data:', err);
      }
    } finally {

      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as User['role'] } : u));
      setSuccessMsg('User role updated successfully');
      setShowSuccess(true);
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, !currentStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
      setSuccessMsg(`User account ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      setShowSuccess(true);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Loading Admin Intelligence...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['ADMIN']}>
        <div className="min-h-screen bg-slate-950 px-6 py-12">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-2xl text-primary">
                  <Shield size={28} />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tight">Admin <span className="text-primary">Command</span></h1>
                  <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">System Overview & User Management</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
                <div className="glass-dark border border-white/5 rounded-3xl p-6 bg-linear-to-br from-primary/5 to-transparent">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-primary/20 rounded-xl text-primary border border-primary/20">
                      <Users size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
                  </div>
                  <div className="text-3xl font-black text-white">{users.length}</div>
                </div>
                <div className="glass-dark border border-white/5 rounded-3xl p-6 bg-linear-to-br from-amber-500/5 to-transparent">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-500 border border-amber-500/20">
                      <Clock size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overdue</span>
                  </div>
                  <div className="text-3xl font-black text-white">{overdueBorrows.length}</div>
                </div>
                <div className="glass-dark border border-white/5 rounded-3xl p-6 bg-linear-to-br from-emerald-500/5 to-transparent">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-500 border border-emerald-500/20">
                      <DollarSign size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Fines</span>
                  </div>
                  <div className="text-3xl font-black text-white">{fineReport?.totalCollected ?? 0} <span className="text-sm font-normal text-slate-500">EGP</span></div>
                </div>
                <div className="glass-dark border border-white/5 rounded-3xl p-6 bg-linear-to-br from-sky-500/5 to-transparent">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-sky-500/20 rounded-xl text-sky-500 border border-sky-500/20">
                      <TrendingUp size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Growth</span>
                  </div>
                  <div className="text-3xl font-black text-white">+12%</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* User Management */}
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-dark border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <Settings className="text-slate-500" size={20} />
                      User Directory
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/2 border-b border-white/5">
                          <th className="px-8 py-5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">User</th>
                          <th className="px-8 py-5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Role</th>
                          <th className="px-8 py-5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Status</th>
                          <th className="px-8 py-5 text-slate-500 text-[10px] font-bold uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-white/1 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-slate-400 font-bold">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-white font-bold">{user.name}</div>
                                  <div className="text-slate-500 text-xs">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <select 
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                              >
                                <option value="STUDENT" className="bg-slate-900">STUDENT</option>
                                <option value="LIBRARIAN" className="bg-slate-900">LIBRARIAN</option>
                                <option value="ADMIN" className="bg-slate-900">ADMIN</option>
                              </select>
                            </td>
                            <td className="px-8 py-6">
                              {user.isActive ? (
                                <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                  Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold uppercase">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => handleStatusToggle(user.id, user.isActive)}
                                className={`p-2.5 rounded-xl border transition-all ${user.isActive ? 'border-red-500/20 text-red-500 hover:bg-red-500/10' : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'}`}
                                title={user.isActive ? 'Deactivate User' : 'Activate User'}
                              >
                                {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Overdue Borrows */}
                <div className="glass-dark border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-white/5 bg-white/2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <AlertTriangle className="text-amber-500" size={20} />
                      Overdue Watchlist
                    </h3>
                  </div>
                  <div className="p-8">
                    {overdueBorrows.length === 0 ? (
                      <div className="text-center py-10">
                        <UserCheck size={40} className="mx-auto text-emerald-500/30 mb-4" />
                        <p className="text-slate-500 text-sm">No overdue borrows at the moment.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {overdueBorrows.map((report) => (
                          <div key={report.id} className="flex items-center justify-between p-5 bg-white/2 border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
                                <Clock size={24} />
                              </div>
                              <div>
                                <h4 className="text-white font-bold group-hover:text-red-400 transition-colors">{report.bookTitle}</h4>
                                <p className="text-slate-500 text-xs">Borrowed by <span className="text-slate-300 font-medium">{report.studentName}</span></p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-red-400 font-black text-lg">{report.overdueDays}d</div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase">Late</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Reports */}
              <div className="space-y-8">
                {/* Top Books Chart (Simplified) */}
                <div className="glass-dark border border-white/5 rounded-[40px] p-8 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    <TrendingUp className="text-sky-500" size={20} />
                    Popular Books
                  </h3>
                  <div className="space-y-8">
                    {topBooks.map((book, idx) => (
                      <div key={book.id} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Rank #{idx + 1}</div>
                            <div className="text-sm font-bold text-white truncate">{book.title}</div>
                          </div>
                          <div className="text-primary font-black">{book.borrowCount}</div>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-linear-to-r from-primary to-sky-400 rounded-full"
                            style={{ width: `${(book.borrowCount / (topBooks[0]?.borrowCount || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Health / Quick Info */}
                <div className="glass-dark border border-white/5 rounded-[40px] p-8 shadow-2xl bg-linear-to-br from-primary/10 to-transparent">
                  <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-xs text-slate-400">Database Connection</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-xs text-slate-400">API Gateway</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-xs text-slate-400">Notification Service</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                  </div>
                  <button className="w-full mt-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2">
                    View System Logs
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {showSuccess && (
          <SuccessToast 
            message={successMsg}
            onClose={() => setShowSuccess(false)} 
          />
        )}
      </RoleGuard>
    </ProtectedRoute>
  );
}
