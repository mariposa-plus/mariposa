'use client';

import { useState, ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { NodeConfiguration, PipelineNode } from '@/types';
import { InputConfigTab } from './tabs/InputConfigTab';
import { OutputConfigTab } from './tabs/OutputConfigTab';
import { getComponentById } from '@/registry';
import { GenericConfigForm } from './config-forms/GenericConfigForm';

interface UniversalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: PipelineNode | null;
  connectedNodes: {
    upstream: PipelineNode[];
    downstream: PipelineNode[];
  };
  title: string;
  color: string;
  icon: ReactNode;
  children: ReactNode; // The component-specific config form
  onSave: (config: NodeConfiguration) => void;
  onSilentSave?: (config: NodeConfiguration) => void; // Save without closing modal
  onDelete: () => void;
}

type TabType = 'input' | 'config' | 'output';

export function UniversalConfigModal({
  isOpen,
  onClose,
  node,
  connectedNodes,
  title,
  color,
  icon,
  children,
  onSave,
  onSilentSave,
  onDelete,
}: UniversalConfigModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const [fullConfig, setFullConfig] = useState<NodeConfiguration>({
    input: node?.data?.fullConfig?.input || {
      mappings: [],
      requiredFields: [],
    },
    component: node?.data?.fullConfig?.component || node?.data?.config || {},
    output: node?.data?.fullConfig?.output || {
      routes: [],
      defaultFields: [],
    },
  });

  // Update fullConfig when node changes
  useEffect(() => {
    if (node) {
      setFullConfig({
        input: node.data?.fullConfig?.input || {
          mappings: [],
          requiredFields: [],
        },
        component: node.data?.fullConfig?.component || node.data?.config || {},
        output: node.data?.fullConfig?.output || {
          routes: [],
          defaultFields: [],
        },
      });
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const tabs: { id: TabType; label: string; count?: number }[] = [
    {
      id: 'input',
      label: 'Input',
      count: connectedNodes.upstream.length
    },
    {
      id: 'config',
      label: 'Configuration'
    },
    {
      id: 'output',
      label: 'Output',
      count: connectedNodes.downstream.length
    },
  ];

  const handleSave = () => {
    onSave(fullConfig);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #2a3f5f',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #2a3f5f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon}
            <h2 style={{ color: '#fff', fontSize: '20px', margin: 0, fontWeight: '600' }}>
              {title}
            </h2>
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
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #2a3f5f',
            padding: '0 24px',
            gap: '4px',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? `3px solid ${color}` : '3px solid transparent',
                color: activeTab === tab.id ? '#fff' : '#888',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  style={{
                    background: activeTab === tab.id ? color : '#2a3f5f',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          {activeTab === 'input' && (
            <InputConfigTab
              inputConfig={fullConfig.input!}
              upstreamNodes={connectedNodes.upstream}
              onChange={(inputConfig) => setFullConfig({ ...fullConfig, input: inputConfig })}
            />
          )}

          {activeTab === 'config' && (() => {
            // Check if component has a schema
            const componentSchema = getComponentById(node.type);

            // If schema exists and has configSchema, use GenericConfigForm
            if (componentSchema && componentSchema.configSchema) {
              return (
                <GenericConfigForm
                  componentSchema={componentSchema}
                  initialConfig={fullConfig.component}
                  inputMappings={fullConfig.input?.mappings || []}
                  upstreamNodes={connectedNodes.upstream}
                  onSave={(config) => {
                    setFullConfig({ ...fullConfig, component: config });
                  }}
                />
              );
            }

            // Otherwise, use the custom component form (children)
            return <div>{children}</div>;
          })()}

          {activeTab === 'output' && (
            <OutputConfigTab
              outputConfig={fullConfig.output!}
              downstreamNodes={connectedNodes.downstream}
              onChange={(outputConfig) => setFullConfig({ ...fullConfig, output: outputConfig })}
            />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px 24px',
            borderTop: '1px solid #2a3f5f',
            display: 'flex',
            gap: '12px',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={onDelete}
            style={{
              padding: '12px 20px',
              background: 'rgba(220, 53, 69, 0.1)',
              color: '#dc3545',
              border: '1px solid rgba(220, 53, 69, 0.3)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Delete Node
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#888',
                border: '1px solid #2a3f5f',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '12px 24px',
                background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
