'use client';

import React, { useState } from 'react';
import { X, BookOpen, Newspaper, GraduationCap, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { BorrowType } from '@/lib/types/borrow';
import { requestBorrow } from '@/lib/api/borrows';

interface BorrowModalProps {
  book: {
    id: number;
    title: string;
    author: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const BORROW_OPTIONS = [
  {
    type: BorrowType.BOOK,
    label: 'Book',
    description: '14 days loan · Renewable',
    days: 14,
    icon: BookOpen,
    color: 'white',
    gradient: 'from-white/5 to-white/0',
    border: 'border-white/10',
    iconColor: 'text-white',
  },
  {
    type: BorrowType.MAGAZINE,
    label: 'Magazine',
    description: '7 days loan · Not renewable',
    days: 7,
    icon: Newspaper,
    color: 'white',
    gradient: 'from-white/5 to-white/0',
    border: 'border-white/10',
    iconColor: 'text-white',
  },
  {
    type: BorrowType.THESIS,
    label: 'Thesis',
    description: '3 days · In-library only',
    days: 3,
    icon: GraduationCap,
    color: 'white',
    gradient: 'from-white/5 to-white/0',
    border: 'border-white/10',
    iconColor: 'text-white',
  },
] as const;

export default function BorrowModal({ book, onClose, onSuccess }: BorrowModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find the matching option based on the book's type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const option = BORROW_OPTIONS.find((o) => o.type === (book as any).type) || BORROW_OPTIONS[0];
  const Icon = option.icon;

  const getDueDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await requestBorrow({ bookId: book.id });
      onSuccess();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit borrow request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#111111] rounded-2xl border border-[#222222] shadow-2xl shadow-black overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 border-b border-[#222222]">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-[#555555] hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
          <h2 className="text-[20px] font-[800] text-white uppercase tracking-tight">Request to Borrow</h2>
          <div className="flex items-center gap-3 mt-3">
             <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-[#333333] text-[#888888] bg-black">
               {option.label}
             </div>
             <p className="text-[#666666] text-sm line-clamp-1">
               <span className="text-white font-semibold">{book.title}</span>
               <span className="mx-2 text-[#333333]">·</span>
               {book.author}
             </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-8">
          
          {/* Item Info Card */}
          <div className="w-full flex items-center gap-5 p-6 rounded-xl border border-[#222222] bg-[#1a1a1a]">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 bg-black border border-[#333333]">
              <Icon size={28} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-lg">
                {option.label} Loan
              </div>
              <div className="text-sm text-[#888888] mt-0.5">
                {option.description}
              </div>
            </div>
            <div className="flex items-center gap-2 text-[12px] font-bold px-3 py-1.5 rounded-full text-white bg-black border border-[#333333]">
              <Calendar size={14} />
              {option.days} Days
            </div>
          </div>

          {/* Details & Rules */}
          <div className="space-y-4">
             <div className="flex items-center justify-between text-[13px] py-2 border-b border-[#222222]">
                <span className="text-[#555555] uppercase tracking-widest font-[500]">Loan Duration</span>
                <span className="text-white font-semibold">{option.days} Days</span>
             </div>
             <div className="flex items-center justify-between text-[13px] py-2 border-b border-[#222222]">
                <span className="text-[#555555] uppercase tracking-widest font-[500]">Estimated Due Date</span>
                <span className="text-white font-bold tracking-tight">{getDueDate(option.days)}</span>
             </div>
             <div className="flex items-center justify-between text-[13px] py-2">
                <span className="text-[#555555] uppercase tracking-widest font-[500]">Late Fee Policy</span>
                <span className="text-white/60 font-medium">Standard Daily Fine</span>
             </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/10 rounded-xl p-4">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400/80 text-sm leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 h-[48px] rounded-lg border border-[#333333] text-[#888888] hover:text-white hover:bg-white/5 transition-all text-[13px] font-[600] uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 h-[48px] rounded-lg bg-white hover:bg-[#eeeeee] text-black text-[13px] font-[800] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing
              </>
            ) : (
              'Confirm Request'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}