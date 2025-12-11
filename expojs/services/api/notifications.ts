import { BaseApiService } from './base';
import * as Types from '@/types/api';

export class NotificationsApiService extends BaseApiService {
    async getNotifications(): Promise<Types.Notification[]> {
        try {
            const response = await this.api.get<Types.ApiResponse<Types.Notification[]>>('/api/notifications');
            return this.extractResult<Types.Notification[]>(response.data, 'notifications') ?? [];
        } catch (error) {
            this.handleError(error);
        }
    }

    async markNotificationRead(id: number): Promise<void> {
        try {
            await this.api.put(`/api/notifications/${id}/read`);
        } catch (error) {
            this.handleError(error);
        }
    }
}
