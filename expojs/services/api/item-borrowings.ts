import { BaseApiService } from './base';
import { ItemBorrowing, ItemBorrowingCreate, ItemBorrowingUpdateStatus } from '@/types/api';

export class ItemBorrowingsApiService extends BaseApiService {
    async listItemBorrowings(): Promise<ItemBorrowing[]> {
        const response = await this.api.get<any>('/api/item-borrowings');
        return this.extractResult(response.data, 'borrowings', 'itemBorrowings') ?? [];
    }

    async getItemBorrowing(id: string): Promise<ItemBorrowing> {
        const response = await this.api.get<any>(`/api/item-borrowings/${id}`);
        return this.extractResult(response.data, 'borrowing', 'itemBorrowing');
    }

    async createItemBorrowing(data: ItemBorrowingCreate): Promise<ItemBorrowing> {
        const response = await this.api.post<any>('/api/item-borrowings', data);
        return this.extractResult(response.data, 'borrowing', 'itemBorrowing');
    }

    async updateItemBorrowingStatus(id: string, data: ItemBorrowingUpdateStatus): Promise<ItemBorrowing> {
        const response = await this.api.put<any>(`/api/item-borrowings/${id}/status`, data);
        return this.extractResult(response.data, 'borrowing', 'itemBorrowing');
    }

    async cancelItemBorrowing(id: string): Promise<void> {
        await this.api.delete(`/api/item-borrowings/${id}`);
    }

    async deleteItemBorrowing(id: string): Promise<void> {
        await this.api.delete(`/api/item-borrowings/${id}`);
    }
}
