'use client';
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#000000] border-t border-[#1a1a1a] py-8 px-12 flex justify-between items-center text-[11px] uppercase tracking-wider text-[#333333]">
      <div>
        © 2024 LIBRAFLOW UNIVERSITY LIBRARY SYSTEM. EDITORIAL PRECISION.
      </div>
      <div className="flex gap-8">
        <Link href="#" className="hover:text-[#555555] transition-colors">TERMS OF ACCESS</Link>
        <Link href="#" className="hover:text-[#555555] transition-colors">SYSTEM STATUS</Link>
      </div>
    </footer>
  );
}
