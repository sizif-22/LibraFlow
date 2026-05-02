'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Book, 
  ClipboardList, 
  RotateCcw, 
  CircleDollarSign, 
  Settings, 
  HelpCircle,
  Plus,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NavUser } from './nav-user';

const navItems = [
  { label: 'DASHBOARD', href: '/librarian/dashboard', icon: LayoutDashboard },
  { label: 'CATALOG', href: '/librarian/books', icon: Book },
  { label: 'BORROW REQUESTS', href: '/librarian/borrows', icon: ClipboardList },
  { label: 'RECORD RETURNS', href: '/librarian/returns', icon: RotateCcw },
  { label: 'FINES', href: '/librarian/fines', icon: CircleDollarSign },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#111111] border-r border-[#1f1f1f] flex flex-col z-50">
      {/* Top Section */}
      <div className="p-8 pb-10 cursor-pointer" onClick={()=> router.push("/")}>
        <div className="text-[14px] font-[800] text-white uppercase tracking-[0.1em]">
          LIBRAFLOW
        </div>
        <div className="text-[10px] text-[#555555] uppercase tracking-[0.15em] mt-1">
          ACADEMIC ARCHIVE
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-[20px] py-[12px] text-[11px] uppercase tracking-[0.1em] transition-all border-l-2 ${
                isActive 
                  ? 'bg-[#1f1f1f] text-white border-white' 
                  : 'text-[#666666] border-transparent hover:text-[#aaaaaa]'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-[#1f1f1f] h-20 flex justify-center p-2">
        <NavUser 
          user={{
            firstName: user?.name?.split(' ')[0] || 'User',
            lastName: user?.name?.split(' ').slice(1).join(' ') || '',
            email: user?.email || '',
          }} 
          onLogout={handleLogout}
        />
      </div>
    </aside>
  );
}

