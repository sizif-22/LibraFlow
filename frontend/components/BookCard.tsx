'use client';

import React from 'react';
import { Book, User, Hash, Tag, CheckCircle, XCircle } from 'lucide-react';

interface BookItem {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  available: number;
}

interface BookCardProps {
  book: BookItem;
}

export default function BookCard({ book }: BookCardProps) {
  const isAvailable = book.available > 0;

  return (
    <div className="glass-dark rounded-2xl border border-white/10 overflow-hidden hover:border-primary/40 transition-all group hover:shadow-2xl hover:shadow-sky-500/10">
      <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <Book size={80} className="text-slate-700 group-hover:text-primary/20 transition-colors" />
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
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent" />
      </div>

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
            Available: <span className={isAvailable ? 'text-emerald-400' : 'text-red-400'}>{book.available}</span> / {book.quantity}
          </div>
          <button
            disabled={!isAvailable}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              isAvailable 
                ? 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            Borrow Now
          </button>
        </div>
      </div>
    </div>
  );
}
