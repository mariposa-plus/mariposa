import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';

export type TestMode = 'validation' | 'dry-run' | 'test' | 'live';
export type TestStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

export interface NodeTestResult {
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  output?: any;
  error?: string;
  transactionId?: string;
  transactionUrl?: string;
  startedAt?: string;
  finishedAt?: string;
  duration?: number;
  logs: string[];
}

export interface TestExecution {
  _id: string;
  pipelineId: string;
  testMode: TestMode;
  status: TestStatus;
  nodeResults: NodeTestResult[];
  validationErrors: Array<{
    nodeId?: string;
    type: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  progress: number;
  currentNodeId?: string;
  totalNodes: number;
  completedNodes: number;
  totalCost?: number;
  estimatedCost?: number;
  startedAt?: string;
  finishedAt?: string;
  duration?: number;
  executionLogs: string[];
  createdAt: string;
  updatedAt: string;
}

export function useTestExecution() {
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testExecution, setTestExecution] = useState<TestExecution | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  /**
   * Start a new test execution
   */
  const startTest = useCallback(
    async (
      pipelineId: string,
      mode: TestMode,
      overrides?: { amounts?: Record<string, number> }
    ): Promise<string | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/executions/test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pipelineId,
            mode,
            overrides,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to start test');
        }

        const executionId = data.data.executionId;

        // Start polling for updates (if not validation mode)
        if (mode !== 'validation') {
          startPolling(executionId);
        } else {
          // For validation mode, fetch once
          await fetchTestStatus(executionId);
        }

        return executionId;
      } catch (err: any) {
        setError(err.message || 'Failed to start test');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [token, API_URL]
  );

  /**
   * Fetch test execution status
   */
  const fetchTestStatus = useCallback(
    async (executionId: string): Promise<TestExecution | null> => {
      try {
        const response = await fetch(`${API_URL}/executions/test/${executionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch test status');
        }

        setTestExecution(data.data);
        return data.data;
      } catch (err: any) {
        setError(err.message || 'Failed to fetch test status');
        return null;
      }
    },
    [token, API_URL]
  );

  /**
   * Start polling for test updates
   */
  const startPolling = useCallback(
    (executionId: string) => {
      // Clear any existing interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }

      // Poll every 2 seconds
      const interval = setInterval(async () => {
        const execution = await fetchTestStatus(executionId);

        // Stop polling if execution is complete
        if (execution && ['success', 'failed', 'cancelled'].includes(execution.status)) {
          clearInterval(interval);
          setPollingInterval(null);
        }
      }, 2000);

      setPollingInterval(interval);
    },
    [fetchTestStatus, pollingInterval]
  );

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  /**
   * Cancel test execution
   */
  const cancelTest = useCallback(
    async (executionId: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_URL}/executions/test/${executionId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to cancel test');
        }

        stopPolling();
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to cancel test');
        return false;
      }
    },
    [token, API_URL, stopPolling]
  );

  /**
   * Get test history for a pipeline
   */
  const getTestHistory = useCallback(
    async (pipelineId: string, limit: number = 10) => {
      try {
        const response = await fetch(`${API_URL}/pipelines/${pipelineId}/tests?limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch test history');
        }

        return data.data;
      } catch (err: any) {
        setError(err.message || 'Failed to fetch test history');
        return null;
      }
    },
    [token, API_URL]
  );

  /**
   * Clear test execution
   */
  const clearTest = useCallback(() => {
    stopPolling();
    setTestExecution(null);
    setError(null);
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return {
    isLoading,
    error,
    testExecution,
    startTest,
    fetchTestStatus,
    cancelTest,
    getTestHistory,
    clearTest,
  };
}
