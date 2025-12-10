// API Configuration
const API_BASE_URL = 'https://backend.atiohaidar.workers.dev';

// Auth Types
export interface User {
    username: string;
    name: string;
    role: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: User;
    message?: string;
}

// Storage keys
const TOKEN_KEY = 'game_auth_token';
const USER_KEY = 'game_auth_user';

/**
 * Login user with credentials
 */
export async function login(username: string, password: string): Promise<AuthResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data: AuthResponse = await response.json();

        if (data.success && data.token && data.user) {
            // Store token and user in localStorage
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'Network error. Please try again.',
        };
    }
}

/**
 * Register new user
 */
export async function register(
    username: string,
    password: string,
    name: string
): Promise<AuthResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, name }),
        });

        const data: AuthResponse = await response.json();

        if (data.success && data.token && data.user) {
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }

        return data;
    } catch (error) {
        console.error('Register error:', error);
        return {
            success: false,
            message: 'Network error. Please try again.',
        };
    }
}

/**
 * Logout user
 */
export function logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Get stored token
 */
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user
 */
export function getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
        return JSON.parse(userJson);
    } catch {
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!getToken();
}

/**
 * Get auth headers for API calls
 */
export function getAuthHeaders(): HeadersInit {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}
