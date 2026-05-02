export interface Fine {
  id: number;
  borrowId: number;
  amount: number;
  isPaid: boolean;
  paidAt: string | null;
  createdAt: string;
  borrow?: {
    book?: {
      title: string;
    };
    student?: {
      name: string;
      email: string;
    };
  };
}
