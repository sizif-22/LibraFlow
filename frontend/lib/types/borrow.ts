// ─── Enums ────────────────────────────────────────────────────────────────────

export enum BorrowType {
  BOOK     = 'BOOK',
  MAGAZINE = 'MAGAZINE',
  THESIS   = 'THESIS',
}

export enum BorrowStatus {
  PENDING  = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED',
}

// ─── Models ───────────────────────────────────────────────────────────────────

export interface BorrowBook {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
}

export interface BorrowStudent {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Borrow {
  id: number;
  studentId: number;
  bookId: number;
  type: BorrowType;
  status: BorrowStatus;
  borrowDate: string;
  dueDate: string | null;
  returnDate: string | null;
  createdAt: string;
  updatedAt: string;
  student: BorrowStudent;
  book: BorrowBook;
  fine: Fine | null;
}

export interface Fine {
  id: number;
  amount: number;
  isPaid: boolean;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateBorrowDto {
  bookId: number;
}
