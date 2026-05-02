'use client';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Library, LogOut, Search } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide navbar on login, register, and librarian pages
  if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/librarian')) {
    return null;
  }

  const isStudent = user?.role === 'STUDENT';
  const isLibrarian = user?.role === 'LIBRARIAN';
  const isAdmin = user?.role === 'ADMIN';

  const navLinks = [
    ...(isStudent ? [
      { label: 'Catalog', href: '/books' },
      { label: 'My Borrows', href: '/student/borrows' },
    ] : []),
    { 
      label: 'Dashboard', 
      href: isAdmin ? '/admin/dashboard' : isLibrarian ? '/librarian/dashboard' : '/student/dashboard' 
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0d0d0d] border-b border-[#1f1f1f] px-10 h-20 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[18px] font-[800] tracking-tight text-white">
            LibraFlow
          </span>
        </Link>

        <div className="flex items-center gap-8">
          {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[14px] transition-colors relative py-1 ${
                    isActive ? 'text-white' : 'text-[#888888] hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-white" />
                  )}
                </Link>
              );
            })}
          </div>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-6">
            {/* <Search size={20} className="text-white cursor-pointer hover:text-gray-300 transition-colors" /> */}
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#333333] flex items-center justify-center text-white text-[14px] font-[600] hover:bg-[#222222] transition-all uppercase"
              >
                {user?.name ? user.name.charAt(0) : 'U'}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-[#222222]">
                    <p className="text-[14px] font-[600] text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-[12px] text-[#888888] truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] text-[#aaaaaa] hover:text-white hover:bg-[#222222] transition-colors flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[14px] text-[#888888] hover:text-white transition-colors">
              Login
            </Link>
            <Link
              href="/register"
              className="text-[14px] bg-white text-black px-5 py-2 rounded-[6px] font-medium hover:bg-gray-200 transition-all"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
