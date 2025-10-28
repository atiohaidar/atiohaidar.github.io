/**
 * @file API client configuration and base functions
 * Centralized API configuration for communicating with the backend
 */

// Backend API base URL - update this when deploying
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

/**
 * Get stored authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

/**
 * Store authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
    localStorage.setItem('auth_token', token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
    localStorage.removeItem('auth_token');
};

/**
 * Get stored user data from localStorage
 */
export const getStoredUser = (): { username: string; name: string; role: string } | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Store user data in localStorage
 */
export const setStoredUser = (user: { username: string; name: string; role: string }): void => {
    localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Remove user data from localStorage
 */
export const removeStoredUser = (): void => {
    localStorage.removeItem('user');
};

/**
 * Create headers with authentication token
 */
export const createAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
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
