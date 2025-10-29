/**
 * @file API client configuration and base functions
 * @deprecated This file is kept for backwards compatibility. Use ./lib/api instead.
 * 
 * Centralized API configuration for communicating with the backend
 */

// Import and re-export from the new consolidated API module
import { API_BASE_URL, auth, apiFetch, createAuthHeaders } from './lib/api/client';

export { API_BASE_URL, auth, apiFetch, createAuthHeaders };

// Backwards compatibility aliases for old function names
export const getAuthToken = () => auth.getToken();
export const setAuthToken = (token: string) => auth.setToken(token);
export const removeAuthToken = () => auth.removeToken();
export const getStoredUser = () => auth.getUser();
export const setStoredUser = (user: { username: string; name: string; role: string }) => auth.setUser(user);
export const removeStoredUser = () => auth.removeUser();
export const clearAuth = () => auth.clear();
