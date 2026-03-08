'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, CheckCircle, XCircle, Loader2, Rocket, Shield, Play, ChevronRight } from 'lucide-react';
import { useDeploymentLogs } from '@/hooks/useDeploymentLogs';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineId: string;
  pipelineName: string;
  isCreAuthenticated: boolean;
  hasGeneratedCode: boolean;
  hasSimulated: boolean;
}

type WizardStep = 'precheck' | 'access' | 'deploy' | 'result';

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'precheck', label: 'Pre-check' },
  { key: 'access', label: 'Access' },
  { key: 'deploy', label: 'Deploy' },
  { key: 'result', label: 'Done' },
];

export function DeploymentModal({
  isOpen,
  onClose,
  pipelineId,
  pipelineName,
  isCreAuthenticated,
  hasGeneratedCode,
  hasSimulated,
}: DeploymentModalProps) {
  const [activeStep, setActiveStep] = useState<WizardStep>('precheck');
  const [target, setTarget] = useState('staging-settings');
  const [deploySuccess, setDeploySuccess] = useState<boolean | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const {
    logs,
    isDeploying,
    currentStep,
    error,
    startAccessRequest,
    startDeploy,
    clearLogs,
  } = useDeploymentLogs(pipelineId);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Track completion events to advance steps
  useEffect(() => {
    if (activeStep === 'access' && !isDeploying && !error && logs.length > 0 && currentStep === null) {
      // Access completed successfully
      setActiveStep('deploy');
    }
  }, [activeStep, isDeploying, error, logs.length, currentStep]);

  useEffect(() => {
    if (activeStep === 'deploy' && !isDeploying && !error && logs.length > 0 && currentStep === null) {
      setDeploySuccess(true);
      setActiveStep('result');
    }
  }, [activeStep, isDeploying, error, logs.length, currentStep]);

  // Track errors to show result
  useEffect(() => {
    if (error && (activeStep === 'access' || activeStep === 'deploy')) {
      setDeploySuccess(false);
      setActiveStep('result');
    }
  }, [error, activeStep]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setActiveStep('precheck');
      setDeploySuccess(null);
      setTarget('staging-settings');
      clearLogs();
    }
  }, [isOpen, clearLogs]);

  const prechecksPassed = isCreAuthenticated && hasGeneratedCode && hasSimulated;

  const stepIndex = STEPS.findIndex(s => s.key === activeStep);

  const handleRequestAccess = () => {
    setActiveStep('access');
    startAccessRequest();
  };

  const handleDeploy = () => {
    startDeploy(target);
  };

  const handleRetry = () => {
    setDeploySuccess(null);
    setActiveStep('precheck');
    clearLogs();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: '#1a1f2e',
        borderRadius: '12px',
        border: '1px solid #2a3f5f',
        width: '700px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #2a3f5f',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Rocket size={20} color="#10b981" />
            <span style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>
              Deploy: {pipelineName}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #2a3f5f',
          gap: '8px',
        }}>
          {STEPS.map((step, i) => (
            <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '16px',
                background: i === stepIndex ? '#2563eb' : i < stepIndex ? '#065f46' : '#1e293b',
                color: i <= stepIndex ? '#fff' : '#64748b',
                fontSize: '13px',
                fontWeight: i === stepIndex ? '600' : '400',
              }}>
                {i < stepIndex ? (
                  <CheckCircle size={14} color="#34d399" />
                ) : (
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: i === stepIndex ? '#3b82f6' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '600',
                  }}>
                    {i + 1}
                  </span>
                )}
                {step.label}
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight size={14} color="#475569" />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {/* Pre-check Step */}
          {activeStep === 'precheck' && (
            <div>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                Verify that all prerequisites are met before deploying your workflow.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <CheckItem label="CRE Authentication" passed={isCreAuthenticated} />
                <CheckItem label="Workflow code generated" passed={hasGeneratedCode} />
                <CheckItem label="Simulation passed" passed={hasSimulated} />
              </div>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleRequestAccess}
                  disabled={!prechecksPassed}
                  style={{
                    padding: '10px 24px',
                    background: prechecksPassed ? '#2563eb' : '#334155',
                    color: prechecksPassed ? '#fff' : '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: prechecksPassed ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  Continue
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Access Step */}
          {activeStep === 'access' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Shield size={18} color="#3b82f6" />
                <span style={{ color: '#fff', fontWeight: '500', fontSize: '15px' }}>
                  Requesting Deployment Access
                </span>
                {isDeploying && currentStep === 'access' && (
                  <Loader2 size={16} color="#fbbf24" style={{ animation: 'spin 1s linear infinite' }} />
                )}
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
                Running <code style={{ background: '#0d1117', padding: '2px 6px', borderRadius: '4px', color: '#e2e8f0' }}>cre account access</code> to verify deployment permissions...
              </p>
              <LogDisplay logs={logs} logsEndRef={logsEndRef} />
            </div>
          )}

          {/* Deploy Step */}
          {activeStep === 'deploy' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Rocket size={18} color="#10b981" />
                <span style={{ color: '#fff', fontWeight: '500', fontSize: '15px' }}>
                  Deploy Workflow
                </span>
                {isDeploying && currentStep === 'deploy' && (
                  <Loader2 size={16} color="#fbbf24" style={{ animation: 'spin 1s linear infinite' }} />
                )}
              </div>

              {/* Target selector */}
              {!isDeploying && logs.length === 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                    Deployment Target
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['staging-settings', 'production-settings'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTarget(t)}
                        style={{
                          padding: '8px 16px',
                          background: target === t ? '#2563eb' : '#1e293b',
                          border: target === t ? '1px solid #3b82f6' : '1px solid #334155',
                          borderRadius: '6px',
                          color: target === t ? '#fff' : '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        {t === 'staging-settings' ? 'Staging' : 'Production'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Deploy button or logs */}
              {!isDeploying && logs.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleDeploy}
                    style={{
                      padding: '10px 24px',
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Play size={16} />
                    Deploy
                  </button>
                </div>
              ) : (
                <LogDisplay logs={logs} logsEndRef={logsEndRef} />
              )}
            </div>
          )}

          {/* Result Step */}
          {activeStep === 'result' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {deploySuccess ? (
                <>
                  <CheckCircle size={48} color="#34d399" style={{ marginBottom: '16px' }} />
                  <h3 style={{ color: '#34d399', fontSize: '20px', margin: '0 0 8px 0' }}>
                    Deployment Successful
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 24px 0' }}>
                    Your workflow has been deployed and activated.
                  </p>
                </>
              ) : (
                <>
                  <XCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
                  <h3 style={{ color: '#ef4444', fontSize: '20px', margin: '0 0 8px 0' }}>
                    Deployment Failed
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 8px 0' }}>
                    {error || 'An unknown error occurred during deployment.'}
                  </p>
                </>
              )}

              {/* Show logs from the failed/successful run */}
              {logs.length > 0 && (
                <div style={{ marginTop: '16px', textAlign: 'left' }}>
                  <LogDisplay logs={logs} logsEndRef={logsEndRef} maxHeight="200px" />
                </div>
              )}

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                {!deploySuccess && (
                  <button
                    onClick={handleRetry}
                    style={{
                      padding: '10px 24px',
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={onClose}
                  style={{
                    padding: '10px 24px',
                    background: deploySuccess ? '#10b981' : '#334155',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spin keyframe animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function CheckItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 14px',
      background: '#0f172a',
      borderRadius: '8px',
      border: `1px solid ${passed ? '#065f46' : '#7f1d1d'}`,
    }}>
      {passed ? (
        <CheckCircle size={18} color="#34d399" />
      ) : (
        <XCircle size={18} color="#ef4444" />
      )}
      <span style={{ color: passed ? '#d1fae5' : '#fecaca', fontSize: '14px' }}>
        {label}
      </span>
    </div>
  );
}

function LogDisplay({
  logs,
  logsEndRef,
  maxHeight = '300px',
}: {
  logs: string[];
  logsEndRef: React.RefObject<HTMLDivElement>;
  maxHeight?: string;
}) {
  return (
    <div style={{
      background: '#0d1117',
      borderRadius: '8px',
      border: '1px solid #21262d',
      padding: '12px 16px',
      maxHeight,
      overflow: 'auto',
      fontFamily: '"Fira Code", "Courier New", monospace',
      fontSize: '13px',
      lineHeight: '1.6',
    }}>
      {logs.length === 0 && (
        <div style={{ color: '#555', fontStyle: 'italic' }}>
          Waiting for output...
        </div>
      )}
      {logs.map((log, i) => (
        <div
          key={i}
          style={{
            color: log.includes('[USER LOG]') ? '#34d399'
              : log.includes('ERROR') || log.includes('error') || log.includes('Error') ? '#ef4444'
              : log.startsWith('---') ? '#fbbf24'
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
  );
}
