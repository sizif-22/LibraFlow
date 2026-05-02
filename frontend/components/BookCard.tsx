'use client';

import React, { useState } from 'react';
import { Book, Newspaper, GraduationCap } from 'lucide-react';
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
  hasUnpaidFine?: boolean;
}

export default function BookCard({ book, hasUnpaidFine = false }: BookCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const isAvailable = book.available > 0;
  const canBorrow = isAvailable && !hasUnpaidFine;

  const handleSuccess = () => {
    setShowModal(false);
    setShowToast(true);
  };

  return (
    <>
      <div className="bg-[#111111] border border-[#222222] rounded-[12px] overflow-hidden transition-all flex flex-col h-full">
        {/* Cover area */}
        <div className="h-[200px] bg-[#1a1a1a] flex items-center justify-center relative">
          {
            book.type == 'BOOK'
            ? <Book size={60} className="text-[#333333]" />
            : book.type == 'MAGAZINE'
            ? <Newspaper size={60} className="text-[#333333]" />
            : book.type == 'THESIS'
            ? <GraduationCap size={60} className="text-[#333333]" />
            : <Book size={60} className="text-[#333333]" />
          }

          <div className="absolute top-4 left-4">
            <div className={`border px-3 py-1 rounded-[20px] text-[11px] font-medium ${
              isAvailable 
                ? 'border-[#444444] text-white' 
                : 'border-[#333333] text-[#555555]'
            }`}>
              {isAvailable ? 'Available' : 'Out of Stock'}
            </div>
          </div>
        </div>

        {/* Info area */}
        <div className="p-4 flex flex-col flex-1">
          <span className="text-[10px] text-[#666666] uppercase tracking-wider font-semibold">
            {book.category}
          </span>
          <h3 className="text-[16px] font-bold text-white mt-1 line-clamp-1">
            {book.title}
          </h3>
          <p className="text-[13px] text-[#888888] italic mt-1 line-clamp-1">
            {book.author}
          </p>
          
          <div className="mt-auto pt-3 flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-[#555555]">
              <span>ISBN: {book.isbn}</span>
              <span>Available: {book.available}/{book.quantity}</span>
            </div>

            <button
              onClick={() => canBorrow && setShowModal(true)}
              disabled={!canBorrow}
              className={`w-full h-[40px] rounded-[6px] text-[12px] font-semibold uppercase tracking-wide mt-3 transition-all ${
                canBorrow
                  ? 'bg-white text-black hover:bg-[#eeeeee]'
                  : 'bg-[#1a1a1a] text-[#444444] cursor-not-allowed border border-[#222222]'
              }`}
            >
              {hasUnpaidFine && isAvailable ? 'Fine Pending' : isAvailable ? 'Borrow Now' : 'Out of Stock'}
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
