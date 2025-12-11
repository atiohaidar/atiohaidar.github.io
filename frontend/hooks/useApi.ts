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
    Ticket,
    Event as ApiEvent,
    DashboardStats,
} from '../apiTypes';
import { setAuthToken, setStoredUser, removeAuthToken, removeStoredUser } from '../apiClient';

// Query keys
export const queryKeys = {
    users: ['users'] as const,
    tasks: ['tasks'] as const,
    task: (id: number) => ['tasks', 'detail', id] as const,
    tickets: ['tickets'] as const,
    events: ['events'] as const,
    stats: ['stats'] as const,
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

export const useUser = (username: string | undefined): UseQueryResult<User, Error> => {
    return useQuery({
        queryKey: ['users', username],
        queryFn: () => api.userService.get(username!),
        enabled: !!username,
    });
};

// Auth hooks
// ... (keep useLogin/Logout as is for now or update if needed, but Login handled separately in component)

// User hooks
// ... (read queries kept as is)

// Task hooks
// ... (read queries kept as is)

import { useLoaderMutation } from './useLoaderMutation';

export const useCreateUser = (): UseMutationResult<User, Error, UserCreate> => {
    const queryClient = useQueryClient();

    return useLoaderMutation({
        mutationFn: api.createUser,
        loader: {
            title: "Creating User",
            subtitle: "Registering new account",
            successMessage: "User created successfully",
            endpoint: "/api/users",
            method: "POST"
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users });
        },
    });
};

export const useUpdateUser = (): UseMutationResult<User, Error, { username: string; updates: UserUpdate }> => {
    const queryClient = useQueryClient();

    return useLoaderMutation({
        mutationFn: ({ username, updates }) => api.updateUser(username, updates),
        loader: {
            title: "Updating User",
            subtitle: "Saving changes",
            successMessage: "Profile updated successfully",
            endpoint: "/api/users/:username",
            method: "PUT"
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users });
        },
    });
};

export const useDeleteUser = (): UseMutationResult<User, Error, string> => {
    const queryClient = useQueryClient();

    return useLoaderMutation({
        mutationFn: api.deleteUser,
        loader: {
            title: "Deleting User",
            subtitle: "Removing account permanently",
            successMessage: "User deleted",
            endpoint: "/api/users/:username",
            method: "DELETE"
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users });
        },
    });
};

export const useTransferBalance = (): UseMutationResult<{ success: boolean; newBalance: number }, Error, { toUsername: string; amount: number; description?: string }> => {
    const queryClient = useQueryClient();

    return useLoaderMutation({
        mutationFn: ({ toUsername, amount, description }) => api.transferBalance(toUsername, amount, description),
        loader: {
            title: "Transferring Funds",
            subtitle: "Processing secure transaction",
            successMessage: "Transfer successful",
            endpoint: "/api/users/transfer",
            method: "POST"
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users });
        },
    });
};

export const useTopUpBalance = (): UseMutationResult<{ success: boolean; newBalance: number }, Error, { targetUsername: string; amount: number; description?: string }> => {
    const queryClient = useQueryClient();

    return useLoaderMutation({
        mutationFn: ({ targetUsername, amount, description }) => api.topUpBalance(targetUsername, amount, description),
        loader: {
            title: "Processing Top Up",
            subtitle: "Adding funds to account",
            successMessage: "Top up successful",
            endpoint: "/api/users/topup",
            method: "POST"
        },
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

export const useCreateTask = (): UseMutationResult<Task, Error, TaskCreate> => {
    const queryClient = useQueryClient();

    return useLoaderMutation({
        mutationFn: api.createTask,
        loader: {
            title: "Creating Task",
            subtitle: "Adding to your list",
            successMessage: "Task created",
            endpoint: "/api/tasks",
            method: "POST"
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
        },
    });
};

export const useDeleteTask = (): UseMutationResult<Task, Error, number> => {
    const queryClient = useQueryClient();

    return useLoaderMutation({
        mutationFn: api.deleteTask,
        loader: {
            title: "Deleting Task",
            subtitle: "Removing item",
            successMessage: "Task deleted",
            endpoint: "/api/tasks/:id",
            method: "DELETE"
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
        },
    });
};

// Ticket hooks
export const useTickets = (params?: { status?: string }): UseQueryResult<Ticket[], Error> => {
    return useQuery({
        queryKey: [...queryKeys.tickets, params],
        queryFn: () => api.listTickets(params),
    });
};

// Event hooks
export const useEvents = (): UseQueryResult<ApiEvent[], Error> => {
    return useQuery({
        queryKey: queryKeys.events,
        queryFn: api.listEvents,
    });
};

// Stats hooks
export const useDashboardStats = (): UseQueryResult<DashboardStats, Error> => {
    return useQuery({
        queryKey: queryKeys.stats,
        queryFn: api.getStats,
        refetchInterval: 60000, // Refresh every minute
    });
};
