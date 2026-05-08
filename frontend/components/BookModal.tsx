'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Save } from 'lucide-react';
import api, { ApiError } from '@/lib/api';


const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().min(1, 'ISBN is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  available: z.number().min(0),
});

type BookForm = z.infer<typeof bookSchema>;

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  available: number;
}

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  book?: Book | null;
}

export default function BookModal({ isOpen, onClose, onSuccess, book }: BookModalProps) {
  const isEditing = !!book;
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookForm>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: '',
      author: '',
      isbn: '',
      category: '',
      quantity: 1,
      available: 1,
    }
  });

  useEffect(() => {
    if (book) {
      reset({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        quantity: book.quantity,
        available: book.available,
      });
    } else {
      reset({
        title: '',
        author: '',
        isbn: '',
        category: '',
        quantity: 1,
        available: 1,
      });
    }
  }, [book, reset]);

  const onSubmit = async (data: BookForm) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEditing && book) {
        await api.put(`/books/${book.id}`, data);
      } else {
        await api.post('/books', data);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError((apiError.response?.data as { message?: string })?.message || 'Failed to save book. Please try again.');
    } finally {

      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-[#111111] border border-[#222222] w-full max-w-xl rounded-[16px] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-8 border-b border-[#1f1f1f]">
          <h2 className="text-[20px] font-[800] text-white uppercase tracking-tight">
            {isEditing ? 'Edit Book Details' : 'Add New Book'}
          </h2>
          <button onClick={onClose} className="text-[#555555] hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {error && (
            <div className="bg-white/5 border border-[#333333] text-white/70 px-4 py-3 rounded-[8px] text-[12px] mb-4 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-[600] text-[#888888] uppercase tracking-[0.1em] ml-1">Title</label>
              <input
                {...register('title')}
                className="w-full bg-[#1a1a1a] border border-[#222222] rounded-[8px] py-3 px-4 text-white placeholder:text-[#444444] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
                placeholder="e.g. Clean Code"
              />
              {errors.title && <p className="text-[#666666] text-[11px] mt-1 ml-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-[600] text-[#888888] uppercase tracking-[0.1em] ml-1">Author</label>
              <input
                {...register('author')}
                className="w-full bg-[#1a1a1a] border border-[#222222] rounded-[8px] py-3 px-4 text-white placeholder:text-[#444444] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
                placeholder="e.g. Robert C. Martin"
              />
              {errors.author && <p className="text-[#666666] text-[11px] mt-1 ml-1">{errors.author.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-[600] text-[#888888] uppercase tracking-[0.1em] ml-1">ISBN</label>
              <input
                {...register('isbn')}
                className="w-full bg-[#1a1a1a] border border-[#222222] rounded-[8px] py-3 px-4 text-white placeholder:text-[#444444] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
                placeholder="Unique ISBN code"
              />
              {errors.isbn && <p className="text-[#666666] text-[11px] mt-1 ml-1">{errors.isbn.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-[600] text-[#888888] uppercase tracking-[0.1em] ml-1">Category</label>
              <div className="relative">
                <select
                  {...register('category')}
                  className="w-full bg-[#1a1a1a] border border-[#222222] rounded-[8px] py-3 px-4 text-white focus:outline-none focus:border-[#444444] appearance-none transition-all text-[14px]"
                >
                  <option value="" className="bg-[#111111]">Select Category</option>
                  <option value="Computer Science" className="bg-[#111111]">Computer Science</option>
                  <option value="History" className="bg-[#111111]">History</option>
                  <option value="Mathematics" className="bg-[#111111]">Mathematics</option>
                  <option value="Physics" className="bg-[#111111]">Physics</option>
                  <option value="Literature" className="bg-[#111111]">Literature</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#555555]">
                  <Save size={14} className="opacity-0" /> {/* Placeholder for alignment if needed, or just let it be */}
                </div>
              </div>
              {errors.category && <p className="text-[#666666] text-[11px] mt-1 ml-1">{errors.category.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-[600] text-[#888888] uppercase tracking-[0.1em] ml-1">Total Quantity</label>
              <input
                {...register('quantity', { valueAsNumber: true })}
                type="number"
                className="w-full bg-[#1a1a1a] border border-[#222222] rounded-[8px] py-3 px-4 text-white focus:outline-none focus:border-[#444444] transition-all text-[14px]"
              />
              {errors.quantity && <p className="text-[#666666] text-[11px] mt-1 ml-1">{errors.quantity.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-[600] text-[#888888] uppercase tracking-[0.1em] ml-1">Available Units</label>
              <input
                {...register('available', { valueAsNumber: true })}
                type="number"
                className="w-full bg-[#1a1a1a] border border-[#222222] rounded-[8px] py-3 px-4 text-white focus:outline-none focus:border-[#444444] transition-all text-[14px]"
              />
              {errors.available && <p className="text-[#666666] text-[11px] mt-1 ml-1">{errors.available.message}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-transparent hover:bg-[#1a1a1a] text-[#888888] hover:text-white py-4 rounded-[8px] text-[12px] font-[700] uppercase tracking-[0.1em] transition-all border border-[#222222]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] bg-white hover:bg-[#eeeeee] text-black py-4 rounded-[8px] text-[12px] font-[800] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-black" size={20} />
              ) : (
                <>
                  <Save size={18} />
                  {isEditing ? 'Update Entry' : 'Add to Archive'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
