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
  const [selectedType, setSelectedType] = useState<BorrowType>(BorrowType.BOOK);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = BORROW_OPTIONS.find((o) => o.type === selectedType)!;

  const getDueDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await requestBorrow({ bookId: book.id, type: selectedType });
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
          <p className="text-slate-400 text-sm line-clamp-1">
            <span className="text-white font-medium">{book.title}</span>
            <span className="mx-2 text-slate-600">·</span>
            {book.author}
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">
          <p className="text-sm text-slate-400 font-medium">Select borrow type:</p>

          {/* Type selector cards */}
          <div className="space-y-3">
            {BORROW_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.type;
              return (
                <button
                  key={option.type}
                  onClick={() => setSelectedType(option.type)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left
                    ${isSelected
                      ? `bg-gradient-to-r ${option.gradient} ${option.border} shadow-lg`
                      : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                    ${isSelected ? `bg-gradient-to-br ${option.gradient} border ${option.border}` : 'bg-white/5 border border-white/10'}`}
                  >
                    <Icon size={20} className={isSelected ? option.iconColor : 'text-slate-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {option.label}
                    </div>
                    <div className={`text-xs mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {option.description}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full
                    ${isSelected ? `${option.iconColor} bg-white/10` : 'text-slate-600 bg-white/5'}`}
                  >
                    <Calendar size={12} />
                    {option.days}d
                  </div>
                </button>
              );
            })}
          </div>

          {/* Due date preview */}
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/5 rounded-2xl p-4">
            <Calendar size={18} className="text-slate-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Estimated due date (if approved)</p>
              <p className="text-white font-medium text-sm">{getDueDate(selected.days)}</p>
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
              'Submit Request'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
