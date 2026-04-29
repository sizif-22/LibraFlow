'use client';

import Link from 'next/link';
import { BookOpen, ShieldCheck, Zap, ArrowRight, Library, Users, Clock } from 'lucide-react';
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
            <div className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-400 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-sky-500/20">
              <Zap size={16} />
              Sprint 2 Live
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 tracking-tight">
              Manage Your Library with <span className="text-gradient">Precision.</span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 leading-relaxed">
              LibraFlow is the modern university solution for book cataloging, 
              automated borrowing tracking, and seamless inventory management.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={user ? "/books" : "/register"}
                className="w-full sm:w-auto bg-primary hover:bg-sky-400 text-primary-foreground px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2 group"
              >
                {user ? 'Go to Catalog' : 'Get Started'}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/books"
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                View Books
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-24 px-6 border-t border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-dark p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all">
              <div className="bg-sky-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-sky-500/30">
                <Library className="text-sky-400" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Catalog</h3>
              <p className="text-slate-400 leading-relaxed">
                Advanced search and categorization makes finding resources across multiple 
                departments faster than ever.
              </p>
            </div>

            <div className="glass-dark p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all">
              <div className="bg-blue-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                <Clock className="text-blue-400" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Tracking</h3>
              <p className="text-slate-400 leading-relaxed">
                Instant availability updates when books are borrowed or returned, 
                ensuring your catalog is always accurate.
              </p>
            </div>

            <div className="glass-dark p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all">
              <div className="bg-indigo-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
                <ShieldCheck className="text-indigo-400" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Role Control</h3>
              <p className="text-slate-400 leading-relaxed">
                Granular permissions for Students, Librarians, and Admins to keep 
                sensitive library operations secure.
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
              <div className="text-5xl font-bold text-white mb-2">12k+</div>
              <div className="text-slate-500 font-medium">Curated Books</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gradient mb-2">99%</div>
              <div className="text-slate-500 font-medium">Uptime Reliable</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">4.8k</div>
              <div className="text-slate-500 font-medium">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gradient mb-2">100%</div>
              <div className="text-slate-500 font-medium">Digital Workflow</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
