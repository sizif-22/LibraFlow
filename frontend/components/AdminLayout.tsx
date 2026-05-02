'use client';

import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

interface AdminLayoutProps {
  children: React.ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  pageTitle?: string;
}

export default function AdminLayout({ 
  children, 
  showSearch, 
  searchPlaceholder,
  pageTitle
}: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <AdminSidebar />
      
      <div className="flex-1 ml-[240px] flex flex-col">
        <AdminNavbar 
          showSearch={showSearch} 
          searchPlaceholder={searchPlaceholder}
          pageTitle={pageTitle}
        />
        
        <main className="flex-1 p-[40px] px-[48px] overflow-auto">
          {children}
        </main>

        <footer className="h-20 px-12 py-8 border-t border-[#1f1f1f] flex items-center justify-between text-[10px] text-[#555555] tracking-wider uppercase">
          <div>© 2024 LIBRAFLOW UNIVERSITY LIBRARY SYSTEM. EDITORIAL PRECISION.</div>
          <div className="flex items-center gap-8">
            <span className="hover:text-white cursor-pointer transition-all">ARCHIVE POLICY</span>
            <span className="hover:text-white cursor-pointer transition-all">TERMS OF ACCESS</span>
            <span className="hover:text-white cursor-pointer transition-all">SYSTEM STATUS</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
