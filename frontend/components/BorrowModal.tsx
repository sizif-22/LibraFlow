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
    color: 'sky',
    gradient: 'from-sky-500/20 to-sky-600/10',
    border: 'border-sky-500/40',
    iconColor: 'text-sky-400',
  },
  {
    type: BorrowType.MAGAZINE,
    label: 'Magazine',
    description: '7 days loan · Not renewable',
    days: 7,
    icon: Newspaper,
    color: 'violet',
    gradient: 'from-violet-500/20 to-violet-600/10',
    border: 'border-violet-500/40',
    iconColor: 'text-violet-400',
  },
  {
    type: BorrowType.THESIS,
    label: 'Thesis',
    description: '3 days · In-library only',
    days: 3,
    icon: GraduationCap,
    color: 'amber',
    gradient: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/40',
    iconColor: 'text-amber-400',
  },
] as const;

export default function BorrowModal({ book, onClose, onSuccess }: BorrowModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find the matching option based on the book's type
  const option = BORROW_OPTIONS.find((o) => o.type === book.type) || BORROW_OPTIONS[0];
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
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-dark rounded-3xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 border-b border-white/5">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold text-white mb-1">Request to Borrow</h2>
          <div className="flex items-center gap-3 mt-2">
             <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${option.border} ${option.iconColor} bg-white/5`}>
               {option.label}
             </div>
             <p className="text-slate-400 text-sm line-clamp-1">
               <span className="text-white font-medium">{book.title}</span>
               <span className="mx-2 text-slate-600">·</span>
               {book.author}
             </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-6">
          
          {/* Item Info Card */}
          <div className={`w-full flex items-center gap-4 p-5 rounded-2xl border bg-gradient-to-r ${option.gradient} ${option.border} shadow-lg`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${option.gradient} border ${option.border}`}>
              <Icon size={24} className={option.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-lg">
                {option.label} Loan
              </div>
              <div className="text-sm text-slate-300">
                {option.description}
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${option.iconColor} bg-white/10`}>
              <Calendar size={14} />
              {option.days} Days
            </div>
          </div>

          {/* Details & Rules */}
          <div className="space-y-3">
             <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                <span className="text-slate-500">Loan Duration</span>
                <span className="text-white font-medium">{option.days} Days</span>
             </div>
             <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                <span className="text-slate-500">Estimated Due Date</span>
                <span className="text-primary font-bold">{getDueDate(option.days)}</span>
             </div>
             <div className="flex items-center justify-between text-sm py-2">
                <span className="text-slate-500">Late Fee Policy</span>
                <span className="text-amber-400 font-medium">Standard Daily Fine</span>
             </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-2xl bg-primary hover:bg-sky-400 text-primary-foreground font-bold transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
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
