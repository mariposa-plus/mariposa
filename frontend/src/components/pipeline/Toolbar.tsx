'use client';

import { Save, Play, Rocket } from 'lucide-react';

interface ToolbarProps {
  pipelineName: string;
  isSaving: boolean;
  lastSaved: Date | null;
  hederaNodesCount: number;
  deployedNodesCount: number;
  onSave: () => void;
  onRun: () => void;
  onDeploy: () => void;
  onBack: () => void;
}

export function Toolbar({
  pipelineName,
  isSaving,
  lastSaved,
  hederaNodesCount,
  deployedNodesCount,
  onSave,
  onRun,
  onDeploy,
  onBack,
}: ToolbarProps) {
  const hasUndeployedNodes = hederaNodesCount > deployedNodesCount;

  return (
    <div
      style={{
        background: '#16213e',
        borderBottom: '1px solid #2a3f5f',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '6px 12px',
            borderRadius: '4px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a2e')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          ← Back
        </button>
        <div>
          <h2 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>
            {pipelineName}
          </h2>
          {lastSaved && (
            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {/* Deployment Status Badge */}
        {hederaNodesCount > 0 && (
          <div
            style={{
              padding: '6px 12px',
              background: hasUndeployedNodes ? '#fbbf24' : '#10b981',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            {deployedNodesCount}/{hederaNodesCount} Deployed
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={isSaving}
          style={{
            padding: '8px 16px',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '600',
            opacity: isSaving ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save'}
        </button>

        {/* Deploy Button */}
        {hederaNodesCount > 0 && (
          <button
            onClick={onDeploy}
            disabled={!hasUndeployedNodes}
            style={{
              padding: '8px 16px',
              background: hasUndeployedNodes ? '#a855f7' : '#4a2866',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: hasUndeployedNodes ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '600',
              opacity: hasUndeployedNodes ? 1 : 0.6,
              transition: 'all 0.2s',
            }}
          >
            <Rocket size={16} />
            Deploy to Hedera
          </button>
        )}

        {/* Run Button */}
        <button
          onClick={onRun}
          style={{
            padding: '8px 16px',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#059669')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}
        >
          <Play size={16} />
          Run
        </button>
      </div>
    </div>
  );
}
