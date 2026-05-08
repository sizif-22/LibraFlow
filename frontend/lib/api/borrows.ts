import api from '../api';
import { Borrow, CreateBorrowDto } from '../types/borrow';

/** US-10: Student requests to borrow a book */
export async function requestBorrow(data: CreateBorrowDto): Promise<Borrow> {
  const res = await api.post('/borrows', data);
  return (res.data as any).borrow;
}

/** US-15: Student fetches their full borrow history */
export async function getMyBorrows(): Promise<Borrow[]> {
  const res = await api.get('/borrows/my');
  return (res.data as any).borrows;
}

/** Librarian fetches all borrow requests */
export async function getAllBorrows(): Promise<Borrow[]> {
  const res = await api.get('/borrows');
  return (res.data as any).borrows;
}

/** US-17: Librarian fetches pending borrow requests */
export async function getPendingBorrows(): Promise<Borrow[]> {
  const res = await api.get('/borrows/pending');
  return (res.data as any).borrows;
}

/** US-11 + US-12: Librarian approves a borrow request */
export async function approveBorrow(id: number): Promise<Borrow> {
  const res = await api.put(`/borrows/${id}/approve`);
  return (res.data as any).borrow;
}

/** US-11: Librarian rejects a borrow request */
export async function rejectBorrow(id: number): Promise<Borrow> {
  const res = await api.put(`/borrows/${id}/reject`);
  return (res.data as any).borrow;
}

/** US-13 + US-14: Librarian records a book return */
export async function returnBorrow(id: number): Promise<Borrow> {
  const res = await api.put(`/borrows/${id}/return`);
  return (res.data as any).borrow;
}
