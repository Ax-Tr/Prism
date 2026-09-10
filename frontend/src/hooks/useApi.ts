import { useState, useEffect, useCallback } from 'react';
import api from '../lib/apiClient';

interface UseApiOptions<T> {
  initialData?: T;
  immediate?: boolean;
}

export function useApi<T>(endpoint: string, options: UseApiOptions<T> = {}) {
  const { initialData, immediate = true } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<T>(endpoint);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (immediate) {
      fetch().catch(() => {});
    }
  }, [fetch, immediate]);

  return { data, loading, error, refetch: fetch, setData };
}
