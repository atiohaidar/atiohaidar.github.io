import { useMutation as useTanStackMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useBackendLoader } from '../contexts/BackendLoaderContext';
import { useRef } from 'react';

// Extended options to include loader config
interface LoaderMutationOptions<TData, TError, TVariables, TContext>
    extends UseMutationOptions<TData, TError, TVariables, TContext> {
    loader?: {
        title: string;
        subtitle?: string;
        successMessage?: string;
        endpoint?: string;
        method?: string;
    };
}

export function useLoaderMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
    options: LoaderMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
    const { showLoader, updateLoader } = useBackendLoader();
    const startTimeRef = useRef<number>(0);
    const { loader, onMutate, onSuccess, onError, ...mutationOptions } = options;

    // Get API base URL for server host display
    let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
    if (loader?.endpoint?.startsWith('http')) {
        API_BASE_URL = loader.endpoint;
    }
    const parsedUrl = new URL(API_BASE_URL);
    const serverHost = parsedUrl.host;
    const isSecure = parsedUrl.protocol === 'https:';

    return useTanStackMutation({
        ...mutationOptions,
        onMutate: async (variables) => {
            // Trigger loader if config exists
            if (loader) {
                startTimeRef.current = performance.now();
                showLoader({
                    title: loader.title,
                    subtitle: loader.subtitle,
                    successMessage: loader.successMessage, // Early set, but updated later
                    endpoint: loader.endpoint || '-',
                    method: loader.method || '-',
                    serverHost,
                    isSecure,
                    completeDelay: 800, // Consistent delay for UX
                });
            }

            // Call original onMutate
            if (onMutate) {
                // @ts-ignore
                return await onMutate(variables);
            }
        },
        onSuccess: (data, variables, context, ...args) => {
            if (loader) {
                const latency = Math.round(performance.now() - startTimeRef.current);
                // Try to get status from data (injected by apiFetch) or default to 200
                const statusCode = (data as any)?.__status || "-";

                updateLoader({
                    status: 'success',
                    actualLatency: latency,
                    actualStatusCode: statusCode,
                    successMessage: loader.successMessage || 'Operation successful'
                });
            }

            if (onSuccess) {
                // @ts-ignore
                onSuccess(data, variables, context, ...args);
            }
        },
        onError: (error, variables, context, ...args) => {
            if (loader) {
                const latency = Math.round(performance.now() - startTimeRef.current);
                const errorObj = error as any;
                const errorMessage = errorObj?.response?.data?.message ||
                    errorObj?.data?.message ||
                    (error instanceof Error ? error.message : 'Operation failed');

                const statusCode = errorObj?.status ||
                    errorObj?.response?.status ||
                    500;

                updateLoader({
                    status: 'error',
                    actualLatency: latency,
                    actualStatusCode: statusCode,
                    errorMessage: errorMessage
                });
            }

            if (onError) {
                // @ts-ignore
                onError(error, variables, context, ...args);
            }
        }
    });
}
