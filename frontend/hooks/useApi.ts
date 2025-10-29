/**
 * @file TanStack Query hooks for API operations
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import * as api from '../apiService';
import type {
    LoginRequest,
    LoginResponse,
    User,
    UserCreate,
    UserUpdate,
    Task,
    TaskCreate,
} from '../apiTypes';
import { setAuthToken, setStoredUser, removeAuthToken, removeStoredUser } from '../apiClient';

// Query keys
export const queryKeys = {
    users: ['users'] as const,
    tasks: ['tasks'] as const,
    task: (id: number) => ['tasks', 'detail', id] as const,
};

// Auth hooks
export const useLogin = (): UseMutationResult<LoginResponse, Error, LoginRequest> => {
    return useMutation({
        mutationFn: api.login,
        onSuccess: (data) => {
            setAuthToken(data.token);
            setStoredUser(data.user);
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    
    return () => {
        removeAuthToken();
        removeStoredUser();
        queryClient.clear();
    };
};

// User hooks
export const useUsers = (): UseQueryResult<User[], Error> => {
    return useQuery({
        queryKey: queryKeys.users,
        queryFn: api.listUsers,
    });
};

export const useCreateUser = (): UseMutationResult<User, Error, UserCreate> => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: api.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users });
        },
    });
};

export const useUpdateUser = (): UseMutationResult<User, Error, { username: string; updates: UserUpdate }> => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ username, updates }) => api.updateUser(username, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users });
        },
    });
};

export const useDeleteUser = (): UseMutationResult<User, Error, string> => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: api.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users });
        },
    });
};

// Task hooks
export const useTasks = (params?: { page?: number; isCompleted?: boolean }): UseQueryResult<Task[], Error> => {
    return useQuery({
        queryKey: [...queryKeys.tasks, params],
        queryFn: () => api.listTasks(params),
    });
};

export const useTask = (id: number | null): UseQueryResult<Task, Error> => {
    const queryKey = id != null ? queryKeys.task(id) : (['tasks', 'detail', 'pending'] as const);

    return useQuery({
        queryKey,
        queryFn: () => api.getTask(id as number),
        enabled: typeof id === 'number',
    });
};

export const useCreateTask = (): UseMutationResult<Task, Error, TaskCreate> => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: api.createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
        },
    });
};

export const useDeleteTask = (): UseMutationResult<Task, Error, number> => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: api.deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
        },
    });
};
