'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Library, LogIn, LogOut, UserPlus, BookOpen, Settings, BookMarked } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass-dark border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Library size={24} className="text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Libra<span className="text-primary">Flow</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/books" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
            <BookOpen size={18} />
            Catalog
          </Link>

          {user && user.role === 'STUDENT' && (
            <Link href="/student/borrows" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
              <BookMarked size={18} />
              My Borrows
            </Link>
          )}

          {user && (user.role === 'LIBRARIAN' || user.role === 'ADMIN') && (
            <Link href="/librarian/books" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
              <Settings size={18} />
              Manage
            </Link>
          )}

          <div className="h-6 w-[1px] bg-white/10 mx-2" />

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm hidden md:inline">
                Welcome, <span className="text-white font-medium">{user.name}</span>
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full transition-all border border-white/10"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                <LogIn size={18} />
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary hover:bg-sky-400 text-primary-foreground px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-sky-500/20"
              >
                <div className="flex items-center gap-2">
                  <UserPlus size={18} />
                  Register
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
