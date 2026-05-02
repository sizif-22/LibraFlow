import api from '../api';
import { Notification } from '../types/notification';

export const notificationsApi = {
  getMyNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/my');
    return response.data;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
};
