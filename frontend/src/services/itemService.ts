import { api } from '@/lib/api';
import { Item } from '@/types';

interface ItemsResponse {
  success: boolean;
  count: number;
  data: Item[];
}

interface ItemResponse {
  success: boolean;
  data: Item;
}

export const itemService = {
  async getItems(): Promise<ItemsResponse> {
    const response = await api.get<ItemsResponse>('/items');
    return response.data;
  },

  async getItem(id: string): Promise<ItemResponse> {
    const response = await api.get<ItemResponse>(`/items/${id}`);
    return response.data;
  },

  async createItem(data: Partial<Item>): Promise<ItemResponse> {
    const response = await api.post<ItemResponse>('/items', data);
    return response.data;
  },

  async updateItem(id: string, data: Partial<Item>): Promise<ItemResponse> {
    const response = await api.put<ItemResponse>(`/items/${id}`, data);
    return response.data;
  },

  async deleteItem(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },
};
