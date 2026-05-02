export enum NotificationType {
  BORROW_APPROVED = 'BORROW_APPROVED',
  BORROW_REJECTED = 'BORROW_REJECTED',
  FINE_ADDED = 'FINE_ADDED',
  DUE_REMINDER = 'DUE_REMINDER',
}

export interface Notification {
  id: number;
  studentId: number;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}
