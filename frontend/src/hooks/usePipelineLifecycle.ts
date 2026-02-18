import { useState, useEffect, useCallback } from 'react';
import {
  activatePipeline,
  deactivatePipeline,
  getPipelineStatus,
  PipelineStatus,
} from '@/services/pipelineLifecycle';

interface UsePipelineLifecycleOptions {
  pipelineId: string;
  token: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UsePipelineLifecycleReturn {
  status: PipelineStatus | null;
  isLoading: boolean;
  isActivating: boolean;
  isDeactivating: boolean;
  error: string | null;
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePipelineLifecycle({
  pipelineId,
  token,
  autoRefresh = false,
  refreshInterval = 5000, // Default 5 seconds
}: UsePipelineLifecycleOptions): UsePipelineLifecycleReturn {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pipeline status
  const refresh = useCallback(async () => {
    if (!pipelineId || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const statusData = await getPipelineStatus(pipelineId, token);
      setStatus(statusData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pipeline status');
      console.error('Error fetching pipeline status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pipelineId, token]);

  // Activate pipeline
  const activate = useCallback(async () => {
    if (!pipelineId || !token) return;

    setIsActivating(true);
    setError(null);

    try {
      await activatePipeline(pipelineId, token);
      await refresh(); // Refresh status after activation
    } catch (err: any) {
      setError(err.message || 'Failed to activate pipeline');
      console.error('Error activating pipeline:', err);
    } finally {
      setIsActivating(false);
    }
  }, [pipelineId, token, refresh]);

  // Deactivate pipeline
  const deactivate = useCallback(async () => {
    if (!pipelineId || !token) return;

    setIsDeactivating(true);
    setError(null);

    try {
      await deactivatePipeline(pipelineId, token);
      await refresh(); // Refresh status after deactivation
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate pipeline');
      console.error('Error deactivating pipeline:', err);
    } finally {
      setIsDeactivating(false);
    }
  }, [pipelineId, token, refresh]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    status,
    isLoading,
    isActivating,
    isDeactivating,
    error,
    activate,
    deactivate,
    refresh,
  };
}
