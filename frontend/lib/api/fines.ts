import api from '../api';
import { Fine } from '../types/fine';

export const finesApi = {
  getMyFines: async (): Promise<Fine[]> => {
    const response = await api.get('/fines/my');
    return response.data.fines || response.data;
  },

  getAllFines: async (): Promise<Fine[]> => {
    const response = await api.get('/fines');
    return response.data.fines || response.data;
  },

  payFine: async (id: number): Promise<Fine> => {
    const response = await api.put(`/fines/${id}/pay`);
    return response.data.fine || response.data;
  },

  calculateFine: async (borrowId: number): Promise<Fine> => {
    const response = await api.post('/fines/calculate', { borrowId });
    return response.data.fine || response.data;
  },
};
