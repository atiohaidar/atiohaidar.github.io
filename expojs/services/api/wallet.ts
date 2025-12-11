import { BaseApiService } from './base';
import * as Types from '@/types/api';

export class WalletApiService extends BaseApiService {
    async getTransactionHistory(): Promise<Types.Transaction[]> {
        try {
            const response = await this.api.get<Types.ApiResponse<Types.Transaction[]>>('/api/transactions');
            return this.extractResult<Types.Transaction[]>(response.data, 'transactions') ?? [];
        } catch (error) {
            this.handleError(error);
        }
    }

    async transferBalance(to_username: string, amount: number, description?: string): Promise<void> {
        try {
            await this.api.post('/api/users/transfer', { to_username, amount, description });
        } catch (error) {
            this.handleError(error);
        }
    }

    async topUpBalance(target_username: string, amount: number, description?: string): Promise<void> {
        try {
            await this.api.post('/api/users/topup', { target_username, amount, description });
        } catch (error) {
            this.handleError(error);
        }
    }
}
