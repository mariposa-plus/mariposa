const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface PipelineStatus {
  pipelineId: string;
  name: string;
  status: 'stopped' | 'activating' | 'active' | 'executing' | 'error';
  isActive: boolean;
  lastActivatedAt?: string;
  lastDeactivatedAt?: string;
  lastExecutedAt?: string;
  executionCount: number;
  errorMessage?: string;
}

/**
 * Activate a pipeline - put it in monitoring mode
 */
export async function activatePipeline(
  pipelineId: string,
  token: string
): Promise<{ success: boolean; data?: any; message: string }> {
  try {
    const response = await fetch(`${API_URL}/pipelines/${pipelineId}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to activate pipeline');
    }

    return data;
  } catch (error: any) {
    console.error('Error activating pipeline:', error);
    throw error;
  }
}

/**
 * Deactivate a pipeline - stop monitoring
 */
export async function deactivatePipeline(
  pipelineId: string,
  token: string
): Promise<{ success: boolean; data?: any; message: string }> {
  try {
    const response = await fetch(`${API_URL}/pipelines/${pipelineId}/deactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to deactivate pipeline');
    }

    return data;
  } catch (error: any) {
    console.error('Error deactivating pipeline:', error);
    throw error;
  }
}

/**
 * Get pipeline status
 */
export async function getPipelineStatus(
  pipelineId: string,
  token: string
): Promise<PipelineStatus> {
  try {
    const response = await fetch(`${API_URL}/pipelines/${pipelineId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch pipeline status');
    }

    return result.data;
  } catch (error: any) {
    console.error('Error fetching pipeline status:', error);
    throw error;
  }
}
