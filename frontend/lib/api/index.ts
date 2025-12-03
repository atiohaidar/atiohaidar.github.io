/**
 * @file Main API module exports
 * Central entry point for all API functionality
 */

// Import auth directly to avoid circular reference
import { auth as authObject, API_BASE_URL, apiFetch, createAuthHeaders } from './client';

// Export client utilities
export { API_BASE_URL, auth as authObject, apiFetch, createAuthHeaders } from './client';

// Export all services
export * from './services';

// Export types
export * from './types';

// Backward compatibility exports for apiClient
export const getAuthToken = () => authObject.getToken();
export const setAuthToken = (token: string) => authObject.setToken(token);
export const removeAuthToken = () => authObject.removeToken();
export const getStoredUser = () => authObject.getUser();
export const setStoredUser = (user: { username: string; name: string; role: string }) => authObject.setUser(user);
export const removeStoredUser = () => authObject.removeUser();
export const clearAuth = () => authObject.clear();

// Also export the auth object for direct access
export { authObject as auth };
