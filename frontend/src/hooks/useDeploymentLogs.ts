'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

type DeployStep = 'access' | 'deploy';

export function useDeploymentLogs(pipelineId: string | null) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [currentStep, setCurrentStep] = useState<DeployStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const projectIdRef = useRef<string | null>(null);

  const connectSocket = useCallback((projectId: string) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(WS_URL);
    socketRef.current = socket;
    projectIdRef.current = projectId;

    socket.on('connect', () => {
      socket.emit('join', { room: `deploy:${projectId}` });
    });

    socket.on('deployment:log', (line: string) => {
      setLogs(prev => [...prev, line]);
    });

    socket.on('deployment:complete', (data: { success: boolean; exitCode: number; step: DeployStep }) => {
      if (!data.success) {
        setError(`${data.step === 'access' ? 'Access request' : 'Deployment'} failed with exit code ${data.exitCode}`);
        setIsDeploying(false);
        setCurrentStep(null);
      } else if (data.step === 'access') {
        // Access step completed successfully
        setIsDeploying(false);
        setCurrentStep(null);
      }
      // For deploy step success, the deploy() call handles both deploy+activate,
      // so we wait for the final completion or error
      if (data.step === 'deploy') {
        setIsDeploying(false);
        setCurrentStep(null);
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const startAccessRequest = useCallback(async () => {
    if (!pipelineId) return;

    setIsDeploying(true);
    setCurrentStep('access');
    setLogs([]);
    setError(null);

    try {
      const response = await api.post(`/cre/pipelines/${pipelineId}/request-access`);
      const projectId = response.data.projectId;
      if (projectId && projectId !== projectIdRef.current) {
        connectSocket(projectId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      setIsDeploying(false);
      setCurrentStep(null);
    }
  }, [pipelineId, connectSocket]);

  const startDeploy = useCallback(async (target: string = 'staging-settings') => {
    if (!pipelineId) return;

    setIsDeploying(true);
    setCurrentStep('deploy');
    setLogs([]);
    setError(null);

    try {
      const response = await api.post(`/cre/pipelines/${pipelineId}/deploy`, { target });
      const projectId = response.data.projectId;
      if (projectId && projectId !== projectIdRef.current) {
        connectSocket(projectId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      setIsDeploying(false);
      setCurrentStep(null);
    }
  }, [pipelineId, connectSocket]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setError(null);
  }, []);

  return { logs, isDeploying, currentStep, error, startAccessRequest, startDeploy, clearLogs };
}
