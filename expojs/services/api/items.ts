import { BaseApiService } from './base';
import { Item, ItemCreate, ItemUpdate } from '@/types/api';

export class ItemsApiService extends BaseApiService {
    async listItems(): Promise<Item[]> {
        const response = await this.api.get<any>('/api/items');
        return this.extractResult(response.data, 'items') ?? [];
    }

    async getItem(id: string): Promise<Item> {
        const response = await this.api.get<any>(`/api/items/${id}`);
        return this.extractResult(response.data, 'item');
    }

    async createItem(data: ItemCreate): Promise<Item> {
        const response = await this.api.post<any>('/api/items', data);
        return this.extractResult(response.data, 'item');
    }

    async updateItem(id: string, data: ItemUpdate): Promise<Item> {
        const response = await this.api.put<any>(`/api/items/${id}`, data);
        return this.extractResult(response.data, 'item');
    }

    async deleteItem(id: string): Promise<void> {
        await this.api.delete(`/api/items/${id}`);
    }
}
