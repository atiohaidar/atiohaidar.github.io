import axios, { AxiosInstance, AxiosError } from 'axios';
import { errorEvents } from '../errorEvents';
import { tokenStorage } from '../tokenStorage';
import * as Types from '@/types/api';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure the base URL for your API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://backend.atiohaidar.workers.dev';

// ============================================================================
// Network Status Manager - Efficient network monitoring with event listener
// Avoids expensive NetInfo.fetch() on every API request
// ============================================================================
class NetworkStatusManager {
    private static instance: NetworkStatusManager;
    private _isConnected: boolean = true;
    private _unsubscribe: (() => void) | null = null;

    private constructor() {
        // Subscribe to network changes once
        this._unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            this._isConnected = state.isConnected ?? true;
        });

        // Initial fetch (one-time only)
        NetInfo.fetch().then((state) => {
            this._isConnected = state.isConnected ?? true;
        });
    }

    static getInstance(): NetworkStatusManager {
        if (!NetworkStatusManager.instance) {
            NetworkStatusManager.instance = new NetworkStatusManager();
        }
        return NetworkStatusManager.instance;
    }

    get isConnected(): boolean {
        return this._isConnected;
    }

    cleanup(): void {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
    }
}

// Initialize network status manager (singleton)
const networkStatus = NetworkStatusManager.getInstance();

export class BaseApiService {
    protected api: AxiosInstance;
    protected token: string | null = null;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor
        this.api.interceptors.request.use(
            async (config) => {
                if (!networkStatus.isConnected) {
                    errorEvents.emit({
                        message: 'Tidak ada koneksi internet. Periksa jaringan Anda.',
                        endpoint: config.url,
                    });
                }
                if (!this.token) {
                    this.token = await tokenStorage.get();
                }
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor
        this.api.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const status = error.response?.status;
                const message = (error.response?.data as { message?: string })?.message ?? error.message;

                errorEvents.emit({
                    message: message || 'Terjadi kesalahan tak terduga.',
                    status,
                    endpoint: error.config?.url,
                });

                if (error.response?.status === 401) {
                    await this.logout();
                }
                return Promise.reject(error);
            }
        );
    }

    protected extractResult<T>(response: Types.ApiResponse<T> | Record<string, unknown>, ...fallbackKeys: string[]): T {
        if (!response) {
            return undefined as unknown as T;
        }

        const candidate = (response as Types.ApiResponse<T>).result ?? (response as Types.ApiResponse<T>).data;
        if (candidate !== undefined) {
            return candidate;
        }

        for (const key of fallbackKeys) {
            if (key in response) {
                return (response as Record<string, unknown>)[key] as T;
            }
        }

        return undefined as unknown as T;
    }

    protected handleError(error: any): never {
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        } else if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.message) {
            throw new Error(error.message);
        }
        throw new Error('An unexpected error occurred');
    }

    async logout(): Promise<void> {
        this.token = null;
        await tokenStorage.delete();
        await AsyncStorage.removeItem('currentUser');
    }
}

export const baseApiService = new BaseApiService();
