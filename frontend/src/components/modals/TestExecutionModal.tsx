'use client';

import { useState, useEffect } from 'react';
import { X, Play, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink, Download } from 'lucide-react';
import { useTestExecution, TestMode, TestExecution as TestExecutionType } from '@/hooks/useTestExecution';

interface TestExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineId: string;
  pipelineName: string;
}

export function TestExecutionModal({
  isOpen,
  onClose,
  pipelineId,
  pipelineName,
}: TestExecutionModalProps) {
  const [step, setStep] = useState<'mode-selection' | 'execution' | 'results'>('mode-selection');
  const [selectedMode, setSelectedMode] = useState<TestMode>('test');
  const { testExecution, isLoading, error, startTest, cancelTest, clearTest } = useTestExecution();

  useEffect(() => {
    if (testExecution && testExecution.status === 'success') {
      setStep('results');
    } else if (testExecution && testExecution.status === 'failed') {
      setStep('results');
    } else if (testExecution && testExecution.status === 'running') {
      setStep('execution');
    }
  }, [testExecution]);

  const handleStartTest = async () => {
    setStep('execution');
    await startTest(pipelineId, selectedMode);
  };

  const handleClose = () => {
    clearTest();
    setStep('mode-selection');
    onClose();
  };

  const handleCancel = async () => {
    if (testExecution?._id) {
      await cancelTest(testExecution._id);
    }
    handleClose();
  };

  const downloadLog = () => {
    if (!testExecution) return;

    const logContent = testExecution.executionLogs.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-execution-${testExecution._id}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const modeOptions = [
    {
      value: 'validation' as const,
      icon: '🔵',
      label: 'Validation Check',
      description: 'Validate configuration (instant)',
      color: '#3b82f6',
    },
    {
      value: 'dry-run' as const,
      icon: '🟡',
      label: 'Dry Run',
      description: 'Simulate execution (no transactions)',
      color: '#fbbf24',
    },
    {
      value: 'test' as const,
      icon: '🟢',
      label: 'Test Execution',
      description: 'Execute with tiny amounts (testnet)',
      color: '#10b981',
    },
    {
      value: 'live' as const,
      icon: '🔴',
      label: 'Live Execution',
      description: 'Full execution (use with caution!)',
      color: '#ef4444',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '12px',
          padding: '24px',
          width: '700px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>🧪 Test Pipeline</h2>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{pipelineName}</p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Step 1: Mode Selection */}
        {step === 'mode-selection' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                Select Test Mode:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {modeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedMode(option.value)}
                    style={{
                      padding: '16px',
                      background: selectedMode === option.value ? `${option.color}20` : '#16213e',
                      border: `2px solid ${selectedMode === option.value ? option.color : '#2a3f5f'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{option.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {selectedMode === 'test' && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '13px', color: '#10b981' }}>
                  ℹ️ Test mode will override all HBAR amounts to 0.01 HBAR and execute on testnet
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleClose}
                style={{
                  padding: '10px 20px',
                  background: '#2a3f5f',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStartTest}
                disabled={isLoading}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Play size={16} />
                Start Test
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Execution Progress */}
        {step === 'execution' && testExecution && (
          <div>
            {/* Progress Bar */}
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: '#16213e',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${testExecution.progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                {testExecution.progress}% Complete - {testExecution.completedNodes} of {testExecution.totalNodes} nodes
              </div>
            </div>

            {/* Execution Log */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Execution Log:</div>
              <div
                style={{
                  background: '#0f172a',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid #1e293b',
                }}
              >
                {testExecution.executionLogs.map((log, idx) => (
                  <div key={idx} style={{ color: '#e0e0e0', marginBottom: '2px' }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel Execution
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && testExecution && (
          <div>
            {/* Status Header */}
            <div
              style={{
                padding: '16px',
                background:
                  testExecution.status === 'success'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${testExecution.status === 'success' ? '#10b981' : '#ef4444'}`,
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {testExecution.status === 'success' ? (
                  <CheckCircle size={24} color="#10b981" />
                ) : (
                  <XCircle size={24} color="#ef4444" />
                )}
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: testExecution.status === 'success' ? '#10b981' : '#ef4444',
                  }}
                >
                  {testExecution.status === 'success' ? 'Test Execution Complete' : 'Test Execution Failed'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#888' }}>
                Duration: {((testExecution.duration || 0) / 1000).toFixed(1)}s | Nodes Executed:{' '}
                {testExecution.completedNodes}/{testExecution.totalNodes}
              </div>
            </div>

            {/* Node Results */}
            {testExecution.nodeResults.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Node Results:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {testExecution.nodeResults.map((node, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        background: '#16213e',
                        borderRadius: '6px',
                        border: `1px solid ${
                          node.status === 'success' ? '#10b981' : node.status === 'failed' ? '#ef4444' : '#2a3f5f'
                        }`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {node.status === 'success' && <CheckCircle size={16} color="#10b981" />}
                          {node.status === 'failed' && <XCircle size={16} color="#ef4444" />}
                          {node.status === 'running' && <Clock size={16} color="#fbbf24" />}
                          <span style={{ fontSize: '14px', fontWeight: '600' }}>{node.nodeLabel}</span>
                          <span style={{ fontSize: '11px', color: '#888' }}>({node.nodeType})</span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#888' }}>
                          {node.duration ? `${node.duration}ms` : ''}
                        </span>
                      </div>

                      {node.transactionUrl && (
                        <div style={{ marginTop: '8px' }}>
                          <a
                            href={node.transactionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '12px',
                              color: '#3b82f6',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            View on HashScan <ExternalLink size={12} />
                          </a>
                        </div>
                      )}

                      {node.error && (
                        <div
                          style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: '#ef4444',
                            background: 'rgba(239, 68, 68, 0.1)',
                            padding: '6px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          Error: {node.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {testExecution.validationErrors.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Validation Issues:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {testExecution.validationErrors.map((err, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        background: err.severity === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                        border: `1px solid ${err.severity === 'error' ? '#ef4444' : '#fbbf24'}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: err.severity === 'error' ? '#ef4444' : '#fbbf24',
                      }}
                    >
                      <AlertCircle size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      {err.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={downloadLog}
                style={{
                  padding: '10px 20px',
                  background: '#2a3f5f',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={16} />
                Download Log
              </button>
              <button
                onClick={() => setStep('mode-selection')}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Run Again
              </button>
              <button
                onClick={handleClose}
                style={{
                  padding: '10px 20px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              marginTop: '20px',
            }}
          >
            <div style={{ fontSize: '13px', color: '#ef4444' }}>❌ {error}</div>
          </div>
        )}
      </div>
    </div>
  );
}
