'use client';

import React, { useState } from 'react';
import { X, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { finesApi } from '@/lib/api/fines';
import { Fine } from '@/lib/types/fine';

interface FinePaymentModalProps {
  fine: Fine;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FinePaymentModal({ fine, onClose, onSuccess }: FinePaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await finesApi.payFine(fine.id);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to record payment:', err);
      setError('Failed to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/20">
              <DollarSign size={22} className="text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Record Payment</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-6 text-center">
            <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Amount to pay</p>
            <div className="text-5xl font-black text-white flex items-baseline justify-center gap-2">
              {fine.amount} <span className="text-xl text-slate-500 font-normal">EGP</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm py-2 border-b border-white/5">
              <span className="text-slate-500">Student</span>
              <span className="text-white font-medium">{fine.borrow?.student?.name}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-white/5">
              <span className="text-slate-500">Book</span>
              <span className="text-white font-medium line-clamp-1">{fine.borrow?.book?.title}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-slate-500">Reference ID</span>
              <span className="text-slate-400 font-mono">#F-{fine.id.toString().padStart(4, '0')}</span>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handlePay}
              disabled={isSubmitting}
              className="flex-2 py-4 rounded-2xl font-bold bg-primary hover:bg-sky-400 text-primary-foreground shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Payment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
