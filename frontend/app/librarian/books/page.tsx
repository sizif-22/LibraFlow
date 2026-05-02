'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import BookModal from '@/components/BookModal';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

import { 
  Plus, Search, Edit2, Trash2, BookOpen, 
  Hash, User, Tag, Layers, Loader2, AlertCircle 
} from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  available: number;
}

export default function LibrarianBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchBooks();
    }
  }, [token]);


  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/books');
      const bookData = response.data.books || response.data;
      setBooks(bookData);
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('Failed to fetch books:', err);
      }
    } finally {

      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/books/${id}`);
      fetchBooks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete book. It might have active borrows.');
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  const filteredBooks = Array.isArray(books) 
    ? books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['LIBRARIAN', 'ADMIN']}>
        <div className="min-h-screen bg-slate-950 px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Manage <span className="text-primary">Catalog</span></h1>
                <p className="text-slate-400">Total books in system: <span className="text-white font-medium">{books.length}</span></p>
              </div>
              <button
                onClick={handleAddNew}
                className="bg-primary hover:bg-sky-400 text-primary-foreground px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2 w-fit"
              >
                <Plus size={20} />
                Add New Book
              </button>
            </div>

            <div className="relative mb-8 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search catalog by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xl"
              />
            </div>

            <div className="glass-dark rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Book Details</th>
                      <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">ISBN</th>
                      <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Stock</th>
                      <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-primary" size={32} />
                            <span className="text-slate-500">Loading catalog data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => (
                        <tr key={book.id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="bg-slate-800 p-3 rounded-xl text-slate-500 group-hover:text-primary transition-colors">
                                <BookOpen size={24} />
                              </div>
                              <div>
                                <div className="text-white font-bold text-lg group-hover:text-primary transition-colors">{book.title}</div>
                                <div className="text-slate-500 text-sm flex items-center gap-1">
                                  <User size={12} />
                                  {book.author}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full text-xs font-medium border border-sky-500/20 flex items-center gap-1 w-fit">
                              <Tag size={12} />
                              {book.category}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-slate-400 font-mono text-sm flex items-center gap-1">
                              <Hash size={12} className="text-slate-600" />
                              {book.isbn}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col items-center">
                              <div className="text-white font-bold">
                                {book.available} <span className="text-slate-500 font-normal">/ {book.quantity}</span>
                              </div>
                              <div className="w-20 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${book.available > 0 ? 'bg-primary' : 'bg-red-500'}`}
                                  style={{ width: `${(book.available / book.quantity) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleEdit(book)}
                                className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all"
                                title="Edit Book"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(book.id)}
                                className="p-2 bg-red-500/5 hover:bg-red-500/20 text-red-500/60 hover:text-red-500 rounded-lg transition-all"
                                title="Delete Book"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-24 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <Layers className="text-slate-800" size={64} />
                            <div className="text-xl font-bold text-slate-400">Inventory Empty</div>
                            <p className="text-slate-600 max-w-xs mx-auto">
                              No books found matching your current search. Try resetting filters or add a new book.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4 bg-amber-500/5 border border-amber-500/10 p-6 rounded-2xl">
              <div className="bg-amber-500/20 p-3 rounded-xl text-amber-500">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Stock Management Note</h4>
                <p className="text-slate-400 text-sm">
                  Deletion is only possible for books with no active borrowing records. 
                  Always verify the physical inventory before updating available counts.
                </p>
              </div>
            </div>
          </div>

          <BookModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchBooks}
            book={editingBook}
          />
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
