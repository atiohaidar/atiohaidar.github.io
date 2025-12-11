import { BaseApiService } from './base';
import * as Types from '@/types/api';
import { tokenStorage } from '../tokenStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthApiService extends BaseApiService {
    async login(credentials: Types.LoginRequest): Promise<Types.LoginResponse> {
        try {
            const response = await this.api.post<Types.ApiResponse<Types.LoginResponse>>(
                '/api/auth/login',
                credentials
            );
            let payload = this.extractResult<Types.LoginResponse>(response.data, 'data');

            if (!payload?.token || !payload?.user) {
                const raw = response.data as unknown as Record<string, unknown>;
                const token = raw.token as string | undefined;
                const user = raw.user as Types.User | undefined;
                if (token && user) {
                    payload = { token, user };
                }
            }

            if (payload?.token && payload?.user) {
                this.token = payload.token;
                await tokenStorage.set(this.token);
                await AsyncStorage.setItem('currentUser', JSON.stringify(payload.user));
                return payload;
            }

            throw new Error('Login failed');
        } catch (error) {
            this.handleError(error);
        }
    }

    async register(username: string, name: string, password: string): Promise<Types.RegisterResponse> {
        try {
            const response = await this.api.post<Types.ApiResponse<Types.RegisterResponse>>(
                '/api/auth/register',
                { username, name, password }
            );
            const payload = this.extractResult<Types.RegisterResponse>(response.data, 'data');

            if (payload?.success) {
                return payload;
            }

            throw new Error(payload?.message || 'Registration failed');
        } catch (error) {
            this.handleError(error);
        }
    }

    async forgotPassword(username: string, newPassword: string): Promise<Types.ForgotPasswordResponse> {
        try {
            const response = await this.api.post<Types.ApiResponse<Types.ForgotPasswordResponse>>(
                '/api/auth/forgot-password',
                { username, newPassword }
            );
            const payload = this.extractResult<Types.ForgotPasswordResponse>(response.data, 'data');

            if (payload?.success) {
                return payload;
            }

            throw new Error(payload?.message || 'Password reset failed');
        } catch (error) {
            this.handleError(error);
        }
    }

    async getCurrentUser(): Promise<Types.User | null> {
        const userStr = await AsyncStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }
}
