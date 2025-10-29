/**
 * @file Custom hooks for API calls with loading and error states
 * Reduces duplication of fetch logic across components
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for API calls with loading and error states
 */
export function useApiCall<T>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiFunction, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedApi<T>(
  apiFunction: (page: number) => Promise<T[]>,
  initialPage = 0
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(pageNum);
      setData(result);
      setHasMore(result.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(0, p - 1));
  const goToPage = (newPage: number) => setPage(Math.max(0, newPage));

  return {
    data,
    loading,
    error,
    page,
    hasMore,
    nextPage,
    prevPage,
    goToPage,
    refetch: () => fetchData(page),
  };
}

/**
 * Hook for mutations (create, update, delete)
 */
export function useMutation<TInput, TOutput>(
  mutationFunction: (input: TInput) => Promise<TOutput>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TOutput | null>(null);

  const mutate = useCallback(
    async (input: TInput) => {
      try {
        setLoading(true);
        setError(null);
        const result = await mutationFunction(input);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutationFunction]
  );

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return { mutate, loading, error, data, reset };
}
