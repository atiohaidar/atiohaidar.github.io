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
        auth.removeToken();
        auth.removeUser();
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
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};
