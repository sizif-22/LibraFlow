/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BookCard from '@/components/BookCard';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getMyBorrows } from '@/lib/api/borrows';
import { Search, Loader2, BookX, ChevronLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

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

export default function CategoryBooksPage() {
  const { name } = useParams();
  const router = useRouter();
  const categoryName = decodeURIComponent(name as string);
  
  const { token, user } = useAuth();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnpaidFine, setHasUnpaidFine] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchBooks();
    if (user?.role === 'STUDENT') {
      checkFineStatus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, token]);

  const checkFineStatus = async () => {
    try {
      const borrows = await getMyBorrows();
      const unpaid = borrows.some((b) => b.fine && !b.fine.isPaid);
      setHasUnpaidFine(unpaid);
    } catch {
      // silently ignore
    }
  };

  const fetchBooks = async (search: string = '') => {
    setIsLoading(true);
    try {
      const response = await api.get(`/books?category=${encodeURIComponent(categoryName)}&search=${encodeURIComponent(search)}&limit=100`);
      const data = response.data as { books: BookItem[] } | BookItem[];
      const bookData = Array.isArray(data) ? data : data.books;
      setBooks(bookData);
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('Failed to fetch books:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(searchTerm);
  };

  return (
    <ProtectedRoute allowedRoles={['STUDENT', 'LIBRARIAN', 'ADMIN']}>
      <div className="min-h-screen bg-[#000000] flex flex-col">
        <div className="flex-1 px-10 py-16">
          <div className="max-w-[1400px] mx-auto">
            
            <button 
              onClick={() => router.push('/books')}
              className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors text-[13px] font-semibold uppercase tracking-widest mb-8"
            >
              <ChevronLeft size={16} /> Back to Catalog
            </button>

            <header className="mb-10 text-left">
              <h1 className="text-[40px] font-extrabold text-white leading-tight uppercase tracking-wide">
                {categoryName}
              </h1>
              <p className="text-[#555555] text-[14px] mt-2">
                Browse all available titles in this category
              </p>
            </header>

            <form onSubmit={handleSearch} className="flex gap-4 mb-16 h-[52px]">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" size={20} />
                <input
                  type="text"
                  placeholder={`Search within ${categoryName}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-full bg-[#111111] border border-[#2a2a2a] rounded-[8px] pl-12 pr-4 text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
                />
              </div>
              <button type="submit" className="h-full bg-white text-black px-8 rounded-[8px] flex items-center gap-2 hover:bg-[#eeeeee] transition-all text-[13px] font-bold uppercase tracking-wider">
               SEARCH
              </button>
            </form>

            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="animate-spin text-[#555555]" size={32} />
              </div>
            ) : books.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {books.map((book) => (
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
                  No documents match your query in this category.
                </p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    fetchBooks('');
                  }}
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
