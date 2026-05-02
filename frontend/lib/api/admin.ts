import api from '../api';
import { User, TopBookReport, OverdueBorrowReport, FineReport } from '../types/admin';

export const adminApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data as User[];
  },

  createUser: async (data: any): Promise<User> => {
    const response = await api.post('/admin/users', data);
    return response.data as User;
  },

  updateUserStatus: async (id: number, isActive: boolean): Promise<User> => {
    const response = await api.put(`/admin/users/${id}/status`, { isActive });
    return response.data as User;
  },

  getTopBooksReport: async (): Promise<TopBookReport[]> => {
    const response = await api.get('/admin/reports/top-books');
    return response.data as TopBookReport[];
  },

  getOverdueBorrowsReport: async (): Promise<OverdueBorrowReport[]> => {
    const response = await api.get('/admin/reports/overdue');
    return response.data as OverdueBorrowReport[];
  },

  getFinesReport: async (): Promise<FineReport> => {
    const response = await api.get('/admin/reports/fines');
    return response.data as FineReport;
  },

  triggerReminders: async (): Promise<{ message: string; count: number }> => {
    const response = await api.post('/admin/reminders/trigger');
    return response.data as { message: string; count: number };
  },
};
