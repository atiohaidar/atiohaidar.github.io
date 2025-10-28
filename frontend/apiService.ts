/**
 * @file API service functions for authentication, users, and tasks
 */
import { apiFetch } from './apiClient';
import type {
    LoginRequest,
    LoginResponse,
    User,
    UserCreate,
    UserUpdate,
    UsersListResponse,
    UserResponse,
    Task,
    TaskCreate,
    TaskUpdate,
    TasksListResponse,
    TaskResponse,
} from './apiTypes';

// Authentication
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiFetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};

// Users
export const listUsers = async (): Promise<User[]> => {
    const response = await apiFetch<UsersListResponse>('/api/users');
    return response.users;
};

export const createUser = async (user: UserCreate): Promise<User> => {
    const response = await apiFetch<UserResponse>('/api/users', {
        method: 'POST',
        body: JSON.stringify(user),
    });
    return response.user;
};

export const updateUser = async (username: string, updates: UserUpdate): Promise<User> => {
    const response = await apiFetch<UserResponse>(`/api/users/${username}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
    return response.user;
};

export const deleteUser = async (username: string): Promise<User> => {
    const response = await apiFetch<UserResponse>(`/api/users/${username}`, {
        method: 'DELETE',
    });
    return response.user;
};

// Tasks
export const listTasks = async (params?: { page?: number; isCompleted?: boolean }): Promise<Task[]> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.isCompleted !== undefined) queryParams.append('isCompleted', params.isCompleted.toString());
    
    const endpoint = `/api/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiFetch<TasksListResponse>(endpoint);
    return response.tasks;
};

export const getTask = async (slug: string): Promise<Task> => {
    const response = await apiFetch<TaskResponse>(`/api/tasks/${slug}`);
    return response.task;
};

export const createTask = async (task: TaskCreate): Promise<Task> => {
    const response = await apiFetch<TaskResponse>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
    });
    return response.task;
};

export const deleteTask = async (slug: string): Promise<Task> => {
    const response = await apiFetch<TaskResponse>(`/api/tasks/${slug}`, {
        method: 'DELETE',
    });
    return response.task;
};
