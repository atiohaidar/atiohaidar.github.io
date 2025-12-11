import { BaseApiService } from './base';
import * as Types from '@/types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class UsersApiService extends BaseApiService {
    async listUsers(): Promise<Types.User[]> {
        try {
            const response = await this.api.get<Types.ApiResponse<Types.User[]>>('/api/users');
            return this.extractResult<Types.User[]>(response.data, 'users') ?? [];
        } catch (error) {
            this.handleError(error);
        }
    }

    async getUser(username: string): Promise<Types.User> {
        try {
            const response = await this.api.get<Types.ApiResponse<Types.User>>(`/api/users/${username}`);
            const user = this.extractResult<Types.User>(response.data, 'user');
            if (user) {
                return user;
            }
            throw new Error('User not found');
        } catch (error) {
            this.handleError(error);
        }
    }

    async createUser(user: Types.UserCreate): Promise<Types.User> {
        try {
            const response = await this.api.post<Types.ApiResponse<Types.User>>('/api/users', user);
            const created = this.extractResult<Types.User>(response.data, 'user');
            if (created) {
                return created;
            }
            throw new Error('User creation failed');
        } catch (error) {
            this.handleError(error);
        }
    }

    async updateUser(username: string, updates: Types.UserUpdate): Promise<Types.User> {
        try {
            const response = await this.api.put<Types.ApiResponse<Types.User>>(
                `/api/users/${username}`,
                updates
            );
            const updated = this.extractResult<Types.User>(response.data, 'user');
            if (updated) {
                return updated;
            }
            throw new Error('User update failed');
        } catch (error) {
            this.handleError(error);
        }
    }

    async updateSelfProfile(updates: Types.UserUpdate): Promise<Types.User> {
        try {
            const response = await this.api.put<Types.ApiResponse<Types.User>>(
                '/api/profile',
                updates
            );
            const updated = this.extractResult<Types.User>(response.data, 'user');
            if (updated) {
                await AsyncStorage.setItem('currentUser', JSON.stringify(updated));
                return updated;
            }
            throw new Error('Profile update failed');
        } catch (error) {
            this.handleError(error);
        }
    }

    async deleteUser(username: string): Promise<void> {
        try {
            await this.api.delete(`/api/users/${username}`);
        } catch (error) {
            this.handleError(error);
        }
    }
}
