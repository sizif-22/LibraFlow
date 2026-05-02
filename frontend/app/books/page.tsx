'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import BookCard from '@/components/BookCard';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getMyBorrows } from '@/lib/api/borrows';
import { Search, Loader2, BookX } from 'lucide-react';
import Footer from '@/components/Footer';

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
      // silently ignore
    }
  };

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/books');
      const data = response.data as { books: BookItem[] } | BookItem[];
      const bookData = Array.isArray(data) ? data : data.books;
      setBooks(bookData);
      setFilteredBooks(bookData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <div className="min-h-screen bg-[#000000] flex flex-col">
        <div className="flex-1 px-10 py-16">
          <div className="max-w-7xl mx-auto">
            <header className="mb-10 text-left">
              <h1 className="text-[40px] font-extrabold text-white leading-tight">
                Explore Our Library Collection
              </h1>
            </header>

            <div className="flex gap-4 mb-12 h-[52px]">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" size={20} />
                <input
                  type="text"
                  placeholder="Search by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-full bg-[#111111] border border-[#2a2a2a] rounded-[8px] pl-12 pr-4 text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
                />
              </div>
              <button className="h-full bg-white text-black px-8 rounded-[8px] flex items-center gap-2 hover:bg-[#eeeeee] transition-all text-[12px] font-semibold uppercase tracking-wider">
                ⚡ FILTER
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="animate-spin text-white" size={48} />
                <p className="text-[#888888] uppercase tracking-widest text-[11px]">ACCESSING ARCHIVES...</p>
              </div>
            ) : filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    hasUnpaidFine={user?.role === 'STUDENT' ? hasUnpaidFine : false}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <BookX className="text-[#333333] mb-6" size={64} />
                <h2 className="text-[20px] font-bold text-white mb-2 uppercase tracking-wide">No Records Found</h2>
                <p className="text-[#555555] max-w-sm text-[14px]">
                  No documents match your query in our current archive.
                </p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-6 text-white hover:underline text-[12px] uppercase tracking-wider font-semibold"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

