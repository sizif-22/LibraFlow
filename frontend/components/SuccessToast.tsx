'use client';

import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function SuccessToast({ message, onClose, duration = 4000 }: SuccessToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300
                      px-5 py-4 rounded-2xl shadow-2xl shadow-black/40 backdrop-blur-md max-w-sm">
        <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="text-emerald-500 hover:text-emerald-300 transition-colors ml-2">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
