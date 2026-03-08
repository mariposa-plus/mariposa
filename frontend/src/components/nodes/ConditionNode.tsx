'use client';

import { memo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { NodeWrapper } from './NodeWrapper';
import { getComponentById } from '@/registry';
import * as LucideIcons from 'lucide-react';

/**
 * ConditionNode
 * Dedicated node for condition (if/else) branching.
 * Renders two labeled source handles at the bottom: "No" (false) at 25% and "Yes" (true) at 75%.
 */
export const ConditionNode = memo(({ data }: NodeProps) => {
  const component = getComponentById(data.type);

  if (!component) {
    return (
      <NodeWrapper
        id={data.id}
        icon={LucideIcons.HelpCircle}
        label={data.label || 'Unknown'}
        color="#888"
        componentType="cre"
      >
        <div style={{ fontSize: '12px', color: '#aaa' }}>Unknown component type: {data.type}</div>
      </NodeWrapper>
    );
  }

  const IconComponent = (LucideIcons as any)[component.icon] || LucideIcons.Box;
  const trueLabel = data.config?.trueLabel || 'Yes';
  const falseLabel = data.config?.falseLabel || 'No';
  const handleColor = component.color;

  return (
    <NodeWrapper
      id={data.id}
      icon={IconComponent}
      label={data.config?.title || component.name}
      color={component.color}
      state={data.state}
      componentType={component.type}
      hasTopHandle={true}
      hasBottomHandle={false}
      hasLeftHandle={false}
      hasRightHandle={false}
    >
      {/* Description */}
      <div style={{ fontSize: '12px', color: '#aaa' }}>
        {data.label || component.description}
      </div>

      {/* Config preview */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div style={{ marginTop: '10px', fontSize: '11px', color: '#888' }}>
          {Object.entries(data.config)
            .filter(([key]) => key !== 'title' && key !== 'trueLabel' && key !== 'falseLabel')
            .slice(0, 3)
            .map(([key, value]) => (
              <div key={key} style={{ marginBottom: '4px' }}>
                <strong>{key}:</strong>{' '}
                {typeof value === 'object' ? JSON.stringify(value).slice(0, 30) + '...' : String(value).slice(0, 30)}
              </div>
            ))}
        </div>
      )}

      {/* Trigger indicator */}
      {component.isTrigger && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '10px',
            fontWeight: '600',
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.2)',
            padding: '2px 6px',
            borderRadius: '4px',
            display: 'inline-block',
          }}
        >
          TRIGGER
        </div>
      )}

      {/* Branch labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '12px',
          padding: '0 4px',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#ef4444' }}>
          {falseLabel}
        </span>
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981' }}>
          {trueLabel}
        </span>
      </div>

      {/* False (No) handle — bottom left at 25% */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{
          left: '25%',
          background: '#ef4444',
          width: '10px',
          height: '10px',
          border: '2px solid #16213e',
        }}
      />

      {/* True (Yes) handle — bottom right at 75% */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{
          left: '75%',
          background: '#10b981',
          width: '10px',
          height: '10px',
          border: '2px solid #16213e',
        }}
      />
    </NodeWrapper>
  );
});

ConditionNode.displayName = 'ConditionNode';
