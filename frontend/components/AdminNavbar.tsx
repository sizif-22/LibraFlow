'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface AdminNavbarProps {
  showSearch?: boolean;
  searchPlaceholder?: string;
  pageTitle?: string;
}

export default function AdminNavbar({ 
  showSearch = false, 
  searchPlaceholder = 'Global Archive Search',
  pageTitle 
}: AdminNavbarProps) {
  return (
    <nav className="h-[52px] bg-[#0d0d0d] border-b border-[#1f1f1f] flex items-center justify-between px-12 shrink-0">
      <div className="flex items-center flex-1">
        {showSearch ? (
          <div className="relative w-[320px]">
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-[6px] h-[36px] pl-4 pr-10 text-[13px] text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all"
            />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555]" />
          </div>
        ) : (
          <h2 className="text-white text-[14px] font-[700] uppercase tracking-wide">{pageTitle}</h2>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Right side status or profile if needed in future */}
      </div>
    </nav>
  );
}

