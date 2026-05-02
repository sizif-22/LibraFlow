'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Library, LogOut, Search } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Hide navbar on login, register, admin, and librarian pages
  if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/admin') || pathname.startsWith('/librarian')) {
    return null;
  }

  const navLinks = [
    { label: 'Catalog', href: '/books' },
    { label: 'My Borrows', href: '/student/borrows' },
    { label: 'Dashboard', href: user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'LIBRARIAN' ? '/librarian/dashboard' : '/student/dashboard' },
    { label: 'Returns', href: '/librarian/returns' },
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
            <Search size={20} className="text-white cursor-pointer" />
            <button
              onClick={logout}
              className="text-[13px] text-white border border-[#444444] rounded-[6px] px-4 py-[6px] hover:bg-white/5 transition-all"
            >
              Logout
            </button>
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
