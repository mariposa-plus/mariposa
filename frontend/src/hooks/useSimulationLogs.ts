'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

export function useSimulationLogs(pipelineId: string | null) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const projectIdRef = useRef<string | null>(null);

  // Connect socket when we have a projectId (set after first simulation)
  const connectSocket = useCallback((projectId: string) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(WS_URL);
    socketRef.current = socket;
    projectIdRef.current = projectId;

    socket.on('connect', () => {
      socket.emit('join', { room: `sim:${projectId}` });
    });

    socket.on('simulation:log', (line: string) => {
      setLogs(prev => [...prev, line]);
    });

    socket.on('simulation:complete', (data: { success: boolean; exitCode: number }) => {
      setIsSimulating(false);
      if (!data.success) {
        setError(`Simulation exited with code ${data.exitCode}`);
      }
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const startSimulation = useCallback(async () => {
    if (!pipelineId) return;

    setIsSimulating(true);
    setLogs([]);
    setError(null);

    try {
      const response = await api.post(`/cre/pipelines/${pipelineId}/simulate`);
      // Backend returns projectId — connect socket to the right room
      const projectId = response.data.projectId;
      if (projectId && projectId !== projectIdRef.current) {
        connectSocket(projectId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      setIsSimulating(false);
    }
  }, [pipelineId, connectSocket]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setError(null);
  }, []);

  return { logs, isSimulating, error, startSimulation, clearLogs };
}
