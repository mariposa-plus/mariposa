'use client';

import { useEffect, useRef } from 'react';
import { X, Play, Trash2, Loader2 } from 'lucide-react';

interface SimulationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: string[];
  isSimulating: boolean;
  error: string | null;
  onSimulate: () => void;
  onClear: () => void;
}

export function SimulationPanel({
  isOpen,
  onClose,
  logs,
  isSimulating,
  error,
  onSimulate,
  onClear,
}: SimulationPanelProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 300,
      right: 0,
      height: '350px',
      background: '#0d1117',
      borderTop: '2px solid #2a3f5f',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderBottom: '1px solid #2a3f5f',
        background: '#161b22',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>
            CRE Simulation
          </span>
          {isSimulating && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: '#fbbf24', fontSize: '12px',
            }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Running...
            </span>
          )}
          {error && (
            <span style={{ color: '#ef4444', fontSize: '12px' }}>
              Error: {error}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onSimulate}
            disabled={isSimulating}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px',
              background: isSimulating ? '#2a3f5f' : '#7c3aed',
              border: 'none', borderRadius: '4px',
              color: '#fff', fontSize: '13px', cursor: isSimulating ? 'not-allowed' : 'pointer',
            }}
          >
            <Play size={14} />
            Simulate
          </button>
          <button
            onClick={onClear}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 8px',
              background: 'transparent', border: '1px solid #2a3f5f',
              borderRadius: '4px', color: '#888', fontSize: '13px', cursor: 'pointer',
            }}
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '4px', background: 'transparent', border: 'none',
              color: '#888', cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Logs */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px 16px',
        fontFamily: '"Fira Code", "Courier New", monospace',
        fontSize: '13px',
        lineHeight: '1.6',
      }}>
        {logs.length === 0 && !isSimulating && (
          <div style={{ color: '#555', fontStyle: 'italic' }}>
            Click "Simulate" to run your CRE workflow...
          </div>
        )}
        {logs.map((log, i) => (
          <div
            key={i}
            style={{
              color: log.includes('[USER LOG]') ? '#34d399'
                : log.includes('ERROR') || log.includes('error') ? '#ef4444'
                : log.startsWith('>>>') ? '#fbbf24'
                : '#c9d1d9',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
