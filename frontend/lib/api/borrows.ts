import api from '@/lib/api';
import type { Borrow, CreateBorrowDto } from '@/lib/types/borrow';

// ─── Student ──────────────────────────────────────────────────────────────────

/** US-10: Student requests to borrow a book */
export async function requestBorrow(data: CreateBorrowDto): Promise<Borrow> {
  const res = await api.post('/borrows', data);
  return res.data.borrow;
}

/** US-15: Student fetches their full borrow history */
export async function getMyBorrows(): Promise<Borrow[]> {
  const res = await api.get('/borrows/my');
  return res.data.borrows;
}

// ─── Librarian ────────────────────────────────────────────────────────────────

/** US-17: Librarian fetches all pending borrow requests */
export async function getPendingBorrows(): Promise<Borrow[]> {
  const res = await api.get('/borrows/pending');
  return res.data.borrows;
}

/** US-11: Librarian approves a borrow request */
export async function approveBorrow(id: number): Promise<Borrow> {
  const res = await api.put(`/borrows/${id}/approve`);
  return res.data.borrow;
}

/** US-11: Librarian rejects a borrow request */
export async function rejectBorrow(id: number): Promise<Borrow> {
  const res = await api.put(`/borrows/${id}/reject`);
  return res.data.borrow;
}

/** US-13: Librarian records a book return */
export async function returnBorrow(id: number): Promise<Borrow> {
  const res = await api.put(`/borrows/${id}/return`);
  return res.data.borrow;
}
