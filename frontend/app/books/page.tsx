'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import BookCard from '@/components/BookCard';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getMyBorrows } from '@/lib/api/borrows';
import { Search, Loader2, BookX, Filter } from 'lucide-react';

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

export default function BooksPage() {
  const { token, user } = useAuth();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<BookItem[]>([]);
  const [hasUnpaidFine, setHasUnpaidFine] = useState(false);


  useEffect(() => {
    if (!token) return;
    fetchBooks();
    if (user?.role === 'STUDENT') {
      checkFineStatus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, token]);


  useEffect(() => {
    if (Array.isArray(books)) {
      const results = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBooks(results);
    }
  }, [searchTerm, books]);

  const checkFineStatus = async () => {
    try {
      const borrows = await getMyBorrows();
      const unpaid = borrows.some((b) => b.fine && !b.fine.isPaid);
      setHasUnpaidFine(unpaid);
    } catch {
      // silently ignore — don't block browsing on fine-check failure
    }
  };

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/books');
      const bookData = response.data.books || response.data;
      setBooks(bookData);
      setFilteredBooks(bookData);
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('Failed to fetch books:', err);
      }
    } finally {

      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-slate-950 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Explore Our <span className="text-gradient">Library Collection</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Browse through a vast collection of books, magazines, and academic theses. 
              Search by title, author, or category to find your next read.
            </p>
          </header>

          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by title, author, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xl"
              />
            </div>
            <button className="bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all font-medium">
              <Filter size={20} />
              Filter
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-slate-400">Fetching latest additions...</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  hasUnpaidFine={user?.role === 'STUDENT' ? hasUnpaidFine : false}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-white/5 p-6 rounded-full mb-6">
                <BookX className="text-slate-600" size={64} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Books Found</h2>
              <p className="text-slate-500 max-w-sm">
                We couldn&apos;t find any books matching your search criteria. Try a different term or browse all books.
              </p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-6 text-primary hover:underline font-medium"
              >
                Clear search and view all
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
