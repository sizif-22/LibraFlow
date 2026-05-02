import api from '../api';
import { User, TopBookReport, OverdueBorrowReport, FineReport } from '../types/admin';

export const adminApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUserRole: async (id: number, role: string): Promise<User> => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  updateUserStatus: async (id: number, isActive: boolean): Promise<User> => {
    const response = await api.put(`/admin/users/${id}/status`, { isActive });
    return response.data;
  },

  getTopBooksReport: async (): Promise<TopBookReport[]> => {
    const response = await api.get('/admin/reports/top-books');
    return response.data;
  },

  getOverdueBorrowsReport: async (): Promise<OverdueBorrowReport[]> => {
    const response = await api.get('/admin/reports/overdue');
    return response.data;
  },

  getFinesReport: async (): Promise<FineReport> => {
    const response = await api.get('/admin/reports/fines');
    return response.data;
  },
};
