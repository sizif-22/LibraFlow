export interface User {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'LIBRARIAN' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface TopBookReport {
  id: number;
  title: string;
  author: string;
  borrowCount: number;
}

export interface OverdueBorrowReport {
  id: number;
  bookTitle: string;
  studentName: string;
  dueDate: string;
  overdueDays: number;
}

export interface FineReport {
  totalCollected: number;
}
