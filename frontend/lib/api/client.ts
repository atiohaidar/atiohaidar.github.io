/**
 * @file Unified API client configuration
 * Consolidates apiClient.ts and provides centralized configuration
 */

/**
 * Backend API base URL
 * - Development: http://localhost:8787 (from .env.development)
 * - Production: https://backend.atiohaidar.workers.dev (from .env.production)
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === 'production'
        ? 'https://backend.atiohaidar.workers.dev'
        : 'http://localhost:8787');

/**
 * Authentication token storage key
 */
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user';

/**
 * Token management utilities
 */
export const auth = {
    getToken: (): string | null => localStorage.getItem(AUTH_TOKEN_KEY),
    setToken: (token: string): void => localStorage.setItem(AUTH_TOKEN_KEY, token),
    removeToken: (): void => localStorage.removeItem(AUTH_TOKEN_KEY),

    getUser: (): { username: string; name: string; role: string } | null => {
        const userStr = localStorage.getItem(USER_DATA_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },
    setUser: (user: { username: string; name: string; role: string }): void => {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    },
    removeUser: (): void => localStorage.removeItem(USER_DATA_KEY),

    clear: (): void => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
    },
};

/**
 * Create headers with authentication token
 */
export const createAuthHeaders = (): HeadersInit => {
    const token = auth.getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(message: string, public status: number, public data?: any) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Generic API fetch function with error handling
 */
export const apiFetch = async <T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            ...createAuthHeaders(),
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            errorData.message || `HTTP error! status: ${response.status}`,
            response.status,
            errorData
        );
    }

    const data = await response.json();

    // Attach status code to the data object and its immediate children (to handle unwrapped responses)
    if (data && typeof data === 'object') {
        const statusDescriptor = {
            value: response.status,
            enumerable: false,
            writable: true,
            configurable: true
        };

        // Attach to root response object
        Object.defineProperty(data, '__status', statusDescriptor);

        // Propagate to immediate children (e.g., response.task, response.data)
        // This ensures that when services return 'response.task', the status code is preserved
        Object.keys(data).forEach(key => {
            const child = (data as any)[key];
            if (child && typeof child === 'object') {
                try {
                    Object.defineProperty(child, '__status', statusDescriptor);
                } catch (e) {
                    // Ignore errors if property cannot be defined
                }
            }
        });
    }

    return data;
};
