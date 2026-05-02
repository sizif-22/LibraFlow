'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Globe, Clock, Shield, Circle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/Footer';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col bg-[#000000] min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-10 text-center flex flex-col items-center">
        <h1 className="text-[56px] font-[800] tracking-tight leading-tight flex flex-col">
          <span className="text-white">Modern Library</span>
          <span className="text-[#555555]">Intelligence.</span>
        </h1>
        <p className="text-[16px] text-[#888888] mt-8 max-w-[500px] leading-relaxed">
          Access the world&apos;s most comprehensive academic archive with an interface designed for deep focus and scholarly rigor. Research, borrow, and track with precision.
        </p>
        <div className="flex items-center gap-4 mt-12">
          <Link
            href="/books"
            className="text-[13px] font-[500] uppercase tracking-wider bg-transparent border border-white text-white px-[28px] py-[12px] rounded-[6px] hover:bg-white hover:text-black transition-all flex items-center gap-2"
          >
            EXPLORE CATALOG <ArrowRight size={14} />
          </Link>
          <Link
            href="/books"
            className="text-[13px] font-[500] uppercase tracking-wider bg-transparent border border-[#444444] text-[#888888] px-[28px] py-[12px] rounded-[6px] hover:border-[#666666] hover:text-white transition-all"
          >
            BROWSE BOOKS
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#111111] border-y border-[#222222] py-[32px] px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center lg:items-start">
            <span className="text-[36px] font-[800] text-white tracking-tight">1.2M</span>
            <span className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-[500] mt-1">TOTAL VOLUMES</span>
          </div>
          <div className="flex flex-col items-center lg:items-start">
            <span className="text-[36px] font-[800] text-white tracking-tight">45k</span>
            <span className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-[500] mt-1">DIGITAL JOURNALS</span>
          </div>
          <div className="flex flex-col items-center lg:items-start">
            <span className="text-[36px] font-[800] text-white tracking-tight">24/7</span>
            <span className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-[500] mt-1">SYSTEM UPTIME</span>
          </div>
          <div className="flex flex-col items-center lg:items-start">
            <span className="text-[36px] font-[800] text-white tracking-tight">100%</span>
            <span className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-[500] mt-1">ACADEMIC PRECISION</span>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-32 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111111] border border-[#222222] rounded-[12px] p-[28px] hover:border-[#444444] transition-all">
            <Search size={20} className="text-[#888888]" />
            <h3 className="text-[18px] font-[700] text-white mt-[20px]">Advanced Search</h3>
            <p className="text-[14px] text-[#666666] leading-relaxed mt-[8px]">
              Utilize Boolean logic and deep metadata filtering to find exactly what your thesis requires.
            </p>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-[12px] p-[28px] hover:border-[#444444] transition-all">
            <Globe size={20} className="text-[#888888]" />
            <h3 className="text-[18px] font-[700] text-white mt-[20px]">Digital Archive</h3>
            <p className="text-[14px] text-[#666666] leading-relaxed mt-[8px]">
              Instant access to high-resolution scans of rare manuscripts and contemporary journals.
            </p>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-[12px] p-[28px] hover:border-[#444444] transition-all">
            <Clock size={20} className="text-[#888888]" />
            <h3 className="text-[18px] font-[700] text-white mt-[20px]">Borrowing History</h3>
            <p className="text-[14px] text-[#666666] leading-relaxed mt-[8px]">
              Track your intellectual journey with detailed records of every resource you&apos;ve accessed.
            </p>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-[12px] p-[28px] hover:border-[#444444] transition-all">
            <Shield size={20} className="text-[#888888]" />
            <h3 className="text-[18px] font-[700] text-white mt-[20px]">Smart Reservations</h3>
            <p className="text-[14px] text-[#666666] leading-relaxed mt-[8px]">
              Automated queue management and notification systems for high-demand academic materials.
            </p>
          </div>
        </div>
      </section>

      {/* Two-Column Section */}
      <section className="pb-32 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative rounded-[12px] overflow-hidden aspect-video bg-[#1a1a1a]">
            <img 
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop" 
              alt="Library Hall" 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute bottom-6 left-6 bg-[#000000] border border-[#333333] px-4 py-2 rounded-full text-white text-[11px] font-[600] uppercase tracking-wider">
              CURATED COLLECTIONS
            </div>
          </div>
          <div>
            <h2 className="text-[32px] font-[800] text-white leading-tight">
              Designed for Researchers, by Researchers.
            </h2>
            <p className="text-[15px] text-[#888888] mt-6 leading-loose">
              LibraFlow eliminates the friction of traditional library systems. Our architecture is built to support long-form research and quick citation retrieval with equal efficiency.
            </p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center gap-3 text-[14px] text-[#aaaaaa]">
                <Circle size={8} fill="#555555" className="text-[#555555]" />
                Direct API integration with university databases
              </li>
              <li className="flex items-center gap-3 text-[14px] text-[#aaaaaa]">
                <Circle size={8} fill="#555555" className="text-[#555555]" />
                Personalized scholarship recommendations
              </li>
              <li className="flex items-center gap-3 text-[14px] text-[#aaaaaa]">
                <Circle size={8} fill="#555555" className="text-[#555555]" />
                Cross-institutional borrowing permissions
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

