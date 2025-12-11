import { BaseApiService } from './base';
import * as Types from '@/types/api';

export class StatsApiService extends BaseApiService {
    async getStats(): Promise<Types.DashboardStats> {
        try {
            const response = await this.api.get<Types.ApiResponse<Types.DashboardStats>>('/api/stats');
            return this.extractResult<Types.DashboardStats>(response.data, 'stats') ?? {};
        } catch (error) {
            this.handleError(error);
        }
    }
}
