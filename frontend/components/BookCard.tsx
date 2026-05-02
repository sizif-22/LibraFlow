'use client';

import React, { useState } from 'react';
import { Book, User, Hash, Tag, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import BorrowModal from '@/components/BorrowModal';
import SuccessToast from '@/components/SuccessToast';

interface BookItem {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  type: string;
  quantity: number;
  available: number;
}

interface BookCardProps {
  book: BookItem;
  /** Pass true if the current student has an unpaid fine — disables borrow button */
  hasUnpaidFine?: boolean;
}

export default function BookCard({ book, hasUnpaidFine = false }: BookCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const isAvailable = book.available > 0;
  const canBorrow = isAvailable && !hasUnpaidFine;

  const getButtonState = () => {
    if (!isAvailable) return { label: 'Out of Stock', title: 'No copies available right now' };
    if (hasUnpaidFine) return { label: 'Fine Pending', title: 'You have an unpaid fine — clear it to borrow' };
    return { label: 'Borrow Now', title: '' };
  };

  const btnState = getButtonState();

  const handleSuccess = () => {
    setShowModal(false);
    setShowToast(true);
  };

  return (
    <>
      <div className="glass-dark rounded-2xl border border-white/10 overflow-hidden hover:border-primary/40 transition-all group hover:shadow-2xl hover:shadow-sky-500/10">
        {/* Cover area */}
        <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
          <Book size={80} className="text-slate-700 group-hover:text-primary/20 transition-colors" />

          {/* Availability badge */}
          <div className="absolute top-4 right-4">
            {isAvailable ? (
              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-emerald-500/30">
                <CheckCircle size={14} />
                Available
              </div>
            ) : (
              <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-red-500/30">
                <XCircle size={14} />
                Out of Stock
              </div>
            )}
          </div>

          {/* Fine warning badge */}
          {hasUnpaidFine && isAvailable && (
            <div className="absolute top-4 left-4 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-amber-500/30">
              <AlertTriangle size={14} />
              Fine Due
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>

        {/* Info area */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
              {book.title}
            </h3>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <User size={16} className="text-slate-500" />
              <span>{book.author}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Tag size={16} className="text-slate-500" />
              <span>{book.category}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Hash size={16} className="text-slate-500" />
              <span>ISBN: {book.isbn}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="text-xs text-slate-500">
              Available:{' '}
              <span className={isAvailable ? 'text-emerald-400' : 'text-red-400'}>
                {book.available}
              </span>{' '}
              / {book.quantity}
            </div>

            <button
              onClick={() => canBorrow && setShowModal(true)}
              disabled={!canBorrow}
              title={btnState.title}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                canBorrow
                  ? 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer'
                  : hasUnpaidFine && isAvailable
                  ? 'bg-amber-500/10 text-amber-600 cursor-not-allowed'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              {btnState.label}
            </button>
          </div>
        </div>
      </div>

      {/* Borrow modal */}
      {showModal && (
        <BorrowModal
          book={book}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Success toast */}
      {showToast && (
        <SuccessToast
          message="Borrow request submitted! Waiting for librarian approval."
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
