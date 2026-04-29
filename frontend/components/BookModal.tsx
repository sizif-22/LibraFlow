'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Save } from 'lucide-react';
import api from '@/lib/api';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="glass-dark border border-white/10 w-full max-w-xl rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Book Details' : 'Add New Book to Catalog'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Title</label>
              <input
                {...register('title')}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Clean Code"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Author</label>
              <input
                {...register('author')}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Robert C. Martin"
              />
              {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">ISBN</label>
              <input
                {...register('isbn')}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Unique ISBN code"
              />
              {errors.isbn && <p className="text-red-500 text-xs mt-1">{errors.isbn.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Category</label>
              <select
                {...register('category')}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
              >
                <option value="" className="bg-slate-900">Select Category</option>
                <option value="Computer Science" className="bg-slate-900">Computer Science</option>
                <option value="History" className="bg-slate-900">History</option>
                <option value="Mathematics" className="bg-slate-900">Mathematics</option>
                <option value="Physics" className="bg-slate-900">Physics</option>
                <option value="Literature" className="bg-slate-900">Literature</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Total Quantity</label>
              <input
                {...register('quantity', { valueAsNumber: true })}
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Available Units</label>
              <input
                {...register('available', { valueAsNumber: true })}
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.available && <p className="text-red-500 text-xs mt-1">{errors.available.message}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold transition-all border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] bg-primary hover:bg-sky-400 text-primary-foreground py-4 rounded-xl font-bold transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={20} />
                  {isEditing ? 'Update Book' : 'Add Book'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
