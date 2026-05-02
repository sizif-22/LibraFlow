'use client';

import Link from 'next/link';
import { Zap, ArrowRight, Library, Bell, DollarSign, BarChart3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-950">
      {/* Hero Section */}
      <div className="relative pt-24 pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-x-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-400 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-sky-500/20 animate-pulse">
              <Zap size={16} />
              Sprint 3 Live: Fines & Admin Intelligence
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-8 tracking-tight">
              Modern Library <span className="text-primary">Intelligence.</span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 leading-relaxed">
              Automated fine calculations, real-time student notifications, 
              and powerful administrative analytics in one beautiful workspace.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={user ? (user.role === 'ADMIN' ? "/admin/dashboard" : (user.role === 'LIBRARIAN' ? "/librarian/dashboard" : "/books")) : "/register"}
                className="w-full sm:w-auto bg-primary hover:bg-sky-400 text-primary-foreground px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2 group"
              >
                {user ? (user.role === 'ADMIN' ? 'Admin Dashboard' : (user.role === 'LIBRARIAN' ? 'Staff Dashboard' : 'Explore Catalog')) : 'Get Started'}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              {(!user || user.role === 'STUDENT') && (
                <Link
                  href="/books"
                  className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  Browse Books
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-24 px-6 border-t border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div className="glass-dark p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all group">
              <div className="bg-sky-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-sky-500/30 group-hover:scale-110 transition-transform">
                <Bell className="text-sky-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Live Alerts</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Stay informed with instant in-app notifications for approvals, 
                rejections, and upcoming due dates.
              </p>
            </div>

            <div className="glass-dark p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all group">
              <div className="bg-amber-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30 group-hover:scale-110 transition-transform">
                <DollarSign className="text-amber-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Fair Fines</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Automated fine calculation using pluggable strategies 
                ensuring fair and transparent late fees.
              </p>
            </div>

            <div className="glass-dark p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all group">
              <div className="bg-indigo-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                <BarChart3 className="text-indigo-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Admin Intelligence</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Comprehensive dashboards for admins to track system health, 
                user roles, and overdue trends.
              </p>
            </div>

            <div className="glass-dark p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all group">
              <div className="bg-emerald-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                <Library className="text-emerald-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Unified Catalog</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Centralized access to books, magazines, and theses 
                with high-speed digital workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto glass-dark rounded-[40px] p-12 border border-white/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            <div className="text-center">
              <div className="text-5xl font-black text-white mb-2">31</div>
              <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">User Stories</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-primary mb-2">0</div>
              <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">Manual Paperwork</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-white mb-2">100%</div>
              <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">Digital Returns</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-primary mb-2">S3</div>
              <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">Milestone Reached</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
