/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import BookCard from '@/components/BookCard';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getMyBorrows } from '@/lib/api/borrows';
import { Search, Loader2, BookX, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
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

interface GroupedBooks {
  category: string;
  books: BookItem[];
}

function CategoryRow({ category, books, hasUnpaidFine, role }: { category: string, books: BookItem[], hasUnpaidFine: boolean, role: string }) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-14">
      {/* Header: Category Name on Left, View More on Right */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-[24px] font-extrabold text-white uppercase tracking-wide">{category}</h2>
        <Link 
          href={`/books/category/${encodeURIComponent(category)}`}
          className="text-[12px] font-semibold text-[#888888] hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1"
        >
          View All <ChevronRight size={14} />
        </Link>
      </div>

      {/* Row Wrapper with Navigation Arrows */}
      <div className="relative group">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 border border-[#333333] rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-[#222222]"
        >
          <ChevronLeft size={20} />
        </button>

        <div 
          ref={rowRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-4 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {books.map((book) => (
            <div key={book.id} className="min-w-[280px] max-w-[280px] shrink-0">
              <BookCard
                book={book}
                hasUnpaidFine={role === 'STUDENT' ? hasUnpaidFine : false}
              />
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 border border-[#333333] rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-[#222222]"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default function BooksPage() {
  const { token, user } = useAuth();
  const [groupedBooks, setGroupedBooks] = useState<GroupedBooks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Available filter options (populated from initial fetch)
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([]);

  const [hasUnpaidFine, setHasUnpaidFine] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchBooks(true); // Initial fetch to populate options
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

  const fetchBooks = async (isInitial = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedAuthor) params.append('author', selectedAuthor);

      const response = await api.get(`/books/grouped?${params.toString()}`);
      const data = response.data as GroupedBooks[];
      
      setGroupedBooks(data);

      if (isInitial) {
        // Extract unique categories and authors
        const cats = new Set<string>();
        const auths = new Set<string>();
        
        data.forEach(group => {
          cats.add(group.category);
          group.books.forEach(book => auths.add(book.author));
        });

        setAvailableCategories(Array.from(cats).sort());
        setAvailableAuthors(Array.from(auths).sort());
      }
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
    fetchBooks();
  };

  return (
    <ProtectedRoute allowedRoles={['STUDENT', 'LIBRARIAN', 'ADMIN']}>
      <div className="min-h-screen bg-[#000000] flex flex-col">
        {/* Added custom style for hiding scrollbar */}
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}} />
        
        <div className="flex-1 px-10 py-16">
          <div className="max-w-[1400px] mx-auto">
            <header className="mb-10 text-left">
              <h1 className="text-[40px] font-extrabold text-white leading-tight">
                Explore Our Library Collection
              </h1>
            </header>

            <div className="flex gap-4 mb-16 relative h-[52px]">
              <form onSubmit={handleSearch} className="flex-1 flex gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" size={20} />
                  <input
                    type="text"
                    placeholder="Search by title, author, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-full bg-[#111111] border border-[#2a2a2a] rounded-[8px] pl-12 pr-4 text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-all text-[14px]"
                  />
                </div>

                <button type="submit" className="h-full bg-white text-black px-8 rounded-[8px] flex items-center justify-center gap-2 hover:bg-[#eeeeee] transition-all text-[13px] font-bold uppercase tracking-wider">
                 SEARCH
                </button>
              </form>

              {/* Filter Button */}
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)} 
                className={`h-full w-[52px] shrink-0 flex items-center justify-center rounded-[8px] border transition-all ${isFilterOpen ? 'bg-white text-black border-white' : 'bg-[#111111] text-white border-[#2a2a2a] hover:border-[#444444]'}`}
              >
                <Filter size={18} />
              </button>

              {/* Filter Dropdown */}
              {isFilterOpen && (
                <div className="absolute right-0 top-[60px] w-[320px] bg-[#111111] border border-[#2a2a2a] rounded-[10px] p-5 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-bold text-[13px] uppercase tracking-widest">Filters</h3>
                    <button onClick={() => setIsFilterOpen(false)} className="text-[#555555] hover:text-white transition-colors">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-[10px] text-[#888888] uppercase tracking-widest font-semibold mb-2">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full h-10 bg-[#1a1a1a] border border-[#333333] rounded-[6px] px-3 text-white focus:outline-none focus:border-[#555555] transition-all text-[13px] cursor-pointer"
                      >
                        <option value="">All Categories</option>
                        {availableCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#888888] uppercase tracking-widest font-semibold mb-2">Author</label>
                      <select
                        value={selectedAuthor}
                        onChange={(e) => setSelectedAuthor(e.target.value)}
                        className="w-full h-10 bg-[#1a1a1a] border border-[#333333] rounded-[6px] px-3 text-white focus:outline-none focus:border-[#555555] transition-all text-[13px] cursor-pointer"
                      >
                        <option value="">All Authors</option>
                        {availableAuthors.map(auth => (
                          <option key={auth} value={auth}>{auth}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => { fetchBooks(); setIsFilterOpen(false); }} 
                      className="flex-1 bg-white text-black h-10 rounded-[6px] text-[12px] font-bold uppercase tracking-wider hover:bg-[#eeeeee] transition-all"
                    >
                      Apply
                    </button>
                    <button 
                      onClick={() => { 
                        setSelectedCategory(''); 
                        setSelectedAuthor(''); 
                        setSearchTerm(''); 
                        setTimeout(() => { fetchBooks(); setIsFilterOpen(false); }, 0); 
                      }} 
                      className="flex-1 bg-transparent border border-[#333333] text-white h-10 rounded-[6px] text-[12px] font-bold uppercase tracking-wider hover:border-[#555555] transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="animate-spin text-[#555555]" size={32} />
              </div>
            ) : groupedBooks.length > 0 ? (
              <div className="flex flex-col gap-8">
                {groupedBooks.map((group) => (
                  <CategoryRow
                    key={group.category}
                    category={group.category}
                    books={group.books}
                    hasUnpaidFine={hasUnpaidFine}
                    role={user?.role || 'STUDENT'}
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
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedAuthor('');
                    setTimeout(() => fetchBooks(), 0);
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

