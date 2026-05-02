'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import BookModal from '@/components/BookModal';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  BarChart, 
  Loader2,
  ChevronLeft,
  ChevronRight
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
      const data = response.data as { books?: Book[] } | Book[];
      const bookData = Array.isArray(data) ? data : data.books || [];
      setBooks(bookData as Book[]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <AdminLayout showSearch={true} searchPlaceholder="Search Archives...">
          <header className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-[32px] font-[800] text-white uppercase tracking-tight">Archival Catalog</h1>
              <p className="text-[14px] text-[#888888] mt-2 max-w-[500px] leading-relaxed">
                Manage the university&apos;s collection of academic resources. Curate entries with editorial precision to maintain the integrity of the archive.
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="bg-white text-black px-[24px] py-[12px] rounded-[6px] font-[600] text-[13px] hover:bg-[#eeeeee] transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Add New Book
            </button>
          </header>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total Volumes', value: '12,482' },
              { label: 'On Loan', value: '843' },
              { label: 'Archive Status', value: '98%' },
              { label: 'System Health', value: 'Operational', italic: true },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] p-[24px]">
                <div className="text-[11px] text-[#888888] uppercase tracking-wider font-[500]">{stat.label}</div>
                <div className={`text-white mt-2 ${stat.italic ? 'text-[20px] italic font-[400]' : 'text-[36px] font-[800]'}`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Table Section */}
          <div className="bg-[#1a1a1a] border border-[#222222] rounded-[10px] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#2a2a2a] text-[12px] text-[#555555] uppercase tracking-widest font-[500]">
                  <th className="px-6 py-4">Asset Identity</th>
                  <th className="px-6 py-4">Classification</th>
                  <th className="px-6 py-4">Stock Availability</th>
                  <th className="px-6 py-4 text-right pr-12">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <Loader2 className="animate-spin text-white mx-auto" size={32} />
                    </td>
                  </tr>
                ) : filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <tr key={book.id} className="group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-[40px] h-[40px] bg-[#222222] rounded-[6px] flex items-center justify-center shrink-0">
                            <BarChart size={18} className="text-[#555555]" />
                          </div>
                          <div>
                            <div className="text-[15px] font-[600] text-white leading-tight">{book.title}</div>
                            <div className="text-[12px] text-[#555555] mt-1">{book.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-[#222222] border border-[#333333] text-white text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-[4px] font-[500]">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="w-[120px] h-[3px] bg-[#333333] rounded-[2px] overflow-hidden">
                            <div 
                              className="h-full bg-white rounded-[2px]"
                              style={{ width: `${Math.min(100, (book.available / book.quantity) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[12px] text-[#888888] ml-3">{Math.round((book.available / book.quantity) * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right pr-12">
                        <div className="flex items-center justify-end gap-4">
                          <Pencil 
                            size={16} 
                            className="text-[#555555] cursor-pointer hover:text-white transition-all" 
                            onClick={() => handleEdit(book)}
                          />
                          <Trash2 
                            size={16} 
                            className="text-[#555555] cursor-pointer hover:text-white transition-all" 
                            onClick={() => handleDelete(book.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-[#555555] uppercase tracking-widest text-[12px]">
                      Archive is currently empty
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Row */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="text-[12px] text-[#555555]">
                Showing {filteredBooks.length} of 12,482 entries
              </div>
              <div className="flex items-center gap-4">
                <button className="text-[12px] text-[#555555] hover:text-white transition-all">Previous</button>
                <button className="bg-transparent border border-[#333333] text-white text-[12px] px-4 py-1.5 rounded-[6px] hover:border-[#444444] transition-all flex items-center gap-2">
                  Next Page <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </AdminLayout>

        <BookModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchBooks}
          book={editingBook}
        />
      </RoleGuard>
    </ProtectedRoute>
  );
}

