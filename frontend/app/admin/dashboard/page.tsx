/* eslint-disable @typescript-eslint/no-explicit-any */
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
  TrendingUp, AlertTriangle, Loader2, ArrowRight, Plus, X, Eye, EyeOff
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

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'LIBRARIAN' });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError('');
    try {
      const newUser = await adminApi.createUser(createForm);
      setUsers(prev => [newUser, ...prev]);
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', role: 'LIBRARIAN' });
      setSuccessMsg('User created successfully');
      setShowSuccess(true);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center gap-4">
        <Loader2 size={48} className="animate-spin text-white" />
        <p className="text-[#888888] font-[500] text-[13px] uppercase tracking-wide">Loading System Data...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['ADMIN']}>
        <div className="min-h-screen bg-[#000000] px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <header className="mb-10">
            <h1 className="text-[36px] font-[800] leading-tight flex items-baseline">
              <span className="text-white">Admin</span>
              <span className="text-[#888888] ml-2">Command</span>
            </h1>
            <p className="text-[13px] text-[#555555] mt-1 uppercase tracking-wider">System Overview & User Management</p>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[24px]">
              <div className="flex justify-between items-start">
                <Users size={18} className="text-[#555555]" />
                <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-[500]">TOTAL USERS</span>
              </div>
              <div className="text-[40px] font-[800] text-white mt-3 leading-none">{users.length}</div>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[24px]">
              <div className="flex justify-between items-start">
                <Clock size={18} className="text-[#555555]" />
                <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-[500]">OVERDUE</span>
              </div>
              <div className="text-[40px] font-[800] text-white mt-3 leading-none">{overdueBorrows.length}</div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[24px]">
              <div className="flex justify-between items-start">
                <DollarSign size={18} className="text-[#555555]" />
                <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-[500]">TOTAL FINES</span>
              </div>
              <div className="text-[40px] font-[800] text-white mt-3 leading-none">
                {fineReport?.totalCollected ?? 0} <span className="text-[14px] font-[500] text-[#555555]">EGP</span>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[24px]">
              <div className="flex justify-between items-start">
                <TrendingUp size={18} className="text-[#555555]" />
                <span className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-[500]">GROWTH</span>
              </div>
              <div className="text-[40px] font-[800] text-white mt-3 leading-none">+12%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* User Directory */}
              <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] overflow-hidden">
                <div className="p-[24px] border-b border-[#222222] flex justify-between items-center bg-[#111111]">
                  <h3 className="text-[16px] font-[700] text-white flex items-center gap-3">
                    <Settings className="text-[#555555]" size={18} />
                    User Directory
                  </h3>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-white text-black text-[12px] font-[600] uppercase tracking-wider px-[16px] py-[8px] rounded-[6px] hover:bg-[#eeeeee] transition-all flex items-center gap-2"
                  >
                    <Plus size={14} /> New User
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#111111] border-b border-[#222222]">
                        <th className="px-[24px] py-[16px] text-[#555555] text-[10px] font-[600] uppercase tracking-widest">User</th>
                        <th className="px-[24px] py-[16px] text-[#555555] text-[10px] font-[600] uppercase tracking-widest">Role</th>
                        <th className="px-[24px] py-[16px] text-[#555555] text-[10px] font-[600] uppercase tracking-widest">Status</th>
                        <th className="px-[24px] py-[16px] text-[#555555] text-[10px] font-[600] uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-[#1f1f1f] transition-colors">
                          <td className="px-[24px] py-[20px]">
                            <div className="flex items-center gap-4">
                              <div className="w-[40px] h-[40px] rounded-[8px] bg-[#2a2a2a] flex items-center justify-center border border-[#333333] text-[#888888] font-[600] text-[14px]">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-white font-[600] text-[14px]">{user.name}</div>
                                <div className="text-[#666666] text-[12px] mt-1">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-[24px] py-[20px]">
                            <span className="text-[12px] font-[600] text-[#cccccc] uppercase tracking-wider">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-[24px] py-[20px]">
                            {user.isActive ? (
                              <span className="flex items-center gap-2 text-[#4ade80] text-[10px] font-[600] uppercase tracking-wide">
                                <div className="w-[6px] h-[6px] rounded-full bg-[#4ade80]" />
                                Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 text-[#f87171] text-[10px] font-[600] uppercase tracking-wide">
                                <div className="w-[6px] h-[6px] rounded-full bg-[#f87171]" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-[24px] py-[20px] text-right">
                            <button 
                              onClick={() => handleStatusToggle(user.id, user.isActive)}
                              className={`p-[8px] rounded-[6px] border transition-all ${user.isActive ? 'border-[#331111] text-[#f87171] hover:bg-[#220808]' : 'border-[#113311] text-[#4ade80] hover:bg-[#082208]'}`}
                              title={user.isActive ? 'Deactivate User' : 'Activate User'}
                            >
                              {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Overdue Borrows */}
              <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] overflow-hidden">
                <div className="p-[24px] border-b border-[#222222] bg-[#111111]">
                  <h3 className="text-[16px] font-[700] text-white flex items-center gap-3">
                    <AlertTriangle className="text-[#f87171]" size={18} />
                    Overdue Watchlist
                  </h3>
                </div>
                <div className="p-[24px]">
                  {overdueBorrows.length === 0 ? (
                    <div className="text-center py-[40px]">
                      <UserCheck size={40} className="mx-auto text-[#333333] mb-4" />
                      <p className="text-[#666666] text-[13px]">No overdue borrows at the moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {overdueBorrows.map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-[20px] bg-[#111111] border border-[#222222] rounded-[8px] hover:border-[#333333] transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-[48px] h-[48px] rounded-[8px] bg-[#220808] flex items-center justify-center text-[#f87171] border border-[#331111]">
                              <Clock size={20} />
                            </div>
                            <div>
                              <h4 className="text-white font-[600] text-[14px] group-hover:text-[#f87171] transition-colors">{report.bookTitle}</h4>
                              <p className="text-[#666666] text-[12px] mt-1">Borrowed by <span className="text-[#aaaaaa] font-[500]">{report.studentName}</span></p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#f87171] font-[800] text-[18px]">{report.overdueDays}d</div>
                            <div className="text-[10px] text-[#555555] font-[600] uppercase tracking-wider mt-1">Late</div>
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
              
              {/* Popular Books */}
              <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[28px]">
                <h3 className="text-[16px] font-[700] text-white mb-8 flex items-center gap-3">
                  <TrendingUp className="text-[#555555]" size={18} />
                  Popular Books
                </h3>
                <div className="space-y-8">
                  {topBooks.map((book, idx) => (
                    <div key={book.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="text-[10px] font-[600] text-[#555555] uppercase tracking-widest mb-1">Rank #{idx + 1}</div>
                          <div className="text-[13px] font-[600] text-white truncate">{book.title}</div>
                        </div>
                        <div className="text-white font-[800] text-[14px]">{book.borrowCount}</div>
                      </div>
                      <div className="h-[4px] bg-[#222222] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full"
                          style={{ width: `${(book.borrowCount / (topBooks[0]?.borrowCount || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Health */}
              <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[28px]">
                <h3 className="text-[16px] font-[700] text-white mb-6">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-[12px] bg-[#111111] rounded-[6px] border border-[#222222]">
                    <span className="text-[12px] text-[#888888] font-[500]">Database Connection</span>
                    <span className="w-[6px] h-[6px] rounded-full bg-[#4ade80]" />
                  </div>
                  <div className="flex items-center justify-between p-[12px] bg-[#111111] rounded-[6px] border border-[#222222]">
                    <span className="text-[12px] text-[#888888] font-[500]">API Gateway</span>
                    <span className="w-[6px] h-[6px] rounded-full bg-[#4ade80]" />
                  </div>
                  <div className="flex items-center justify-between p-[12px] bg-[#111111] rounded-[6px] border border-[#222222]">
                    <span className="text-[12px] text-[#888888] font-[500]">Notification Service</span>
                    <span className="w-[6px] h-[6px] rounded-full bg-[#4ade80]" />
                  </div>
                </div>
                <button className="w-full mt-6 h-[40px] rounded-[6px] bg-[#222222] hover:bg-[#333333] text-white text-[12px] font-[600] uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                  View System Logs
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>

          {/* Create User Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-[480px] bg-[#1a1a1a] border border-[#333333] rounded-[12px] shadow-2xl overflow-hidden">
                <div className="p-[24px] border-b border-[#333333] flex justify-between items-center bg-[#111111]">
                  <h2 className="text-[18px] font-[700] text-white">Create User Account</h2>
                  <button onClick={() => setShowCreateModal(false)} className="text-[#888888] hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-[24px]">
                  {createError && (
                    <div className="bg-[#220808] border border-[#331111] text-[#f87171] px-4 py-3 rounded-[8px] text-[13px] mb-6">
                      {createError}
                    </div>
                  )}

                  <form onSubmit={handleCreateUser} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[11px] text-[#888888] uppercase tracking-wide font-[600]">Full Name</label>
                      <input
                        type="text"
                        required
                        value={createForm.name}
                        onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                        placeholder="full name"
                        className="w-full h-[48px] bg-[#111111] border border-[#333333] rounded-[8px] px-[16px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#555555] transition-all text-[14px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[11px] text-[#888888] uppercase tracking-wide font-[600]">Email</label>
                      <input
                        type="email"
                        required
                        value={createForm.email}
                        onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                        placeholder="name@university.edu"
                        className="w-full h-[48px] bg-[#111111] border border-[#333333] rounded-[8px] px-[16px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#555555] transition-all text-[14px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-[#888888] uppercase tracking-wide font-[600]">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={createForm.password}
                          onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                          placeholder="••••••••"
                          className="w-full h-[48px] bg-[#111111] border border-[#333333] rounded-[8px] pl-[16px] pr-[44px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#555555] transition-all text-[14px]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#888888] transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* <div className="space-y-2">
                      <label className="text-[11px] text-[#888888] uppercase tracking-wide font-[600]">Role</label>
                      <select
                        value={createForm.role}
                        onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                        className="w-full h-[48px] bg-[#111111] border border-[#333333] rounded-[8px] px-[16px] text-white focus:outline-none focus:border-[#555555] transition-all text-[14px] appearance-none cursor-pointer"
                      >
                        <option value="LIBRARIAN">Librarian</option>
                        <option value="STUDENT">Student</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div> */}

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-[20px] py-[10px] text-[13px] font-[600] text-[#888888] hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isCreating}
                        className="bg-white text-black text-[13px] font-[600] px-[24px] py-[10px] rounded-[6px] hover:bg-[#eeeeee] transition-all flex items-center gap-2"
                      >
                        {isCreating ? <Loader2 size={16} className="animate-spin" /> : 'Create Account'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {showSuccess && (
            <SuccessToast 
              message={successMsg}
              onClose={() => setShowSuccess(false)} 
            />
          )}
          </div>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}