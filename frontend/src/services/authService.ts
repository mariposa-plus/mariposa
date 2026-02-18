import { api } from '@/lib/api';
import { User } from '@/types';

export const authService = {
  async sendOTP(email: string): Promise<{ success: boolean; message: string; email: string }> {
    const response = await api.post('/auth/login', { email });
    return response.data;
  },

  async verifyOTP(email: string, code: string): Promise<{ success: boolean; token: string; user: User }> {
    const response = await api.post('/auth/verify', { email, code });
    return response.data;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
