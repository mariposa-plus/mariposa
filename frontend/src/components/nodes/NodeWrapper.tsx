'use client';

import { ReactNode } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeState, ComponentType } from '@/types';

interface NodeWrapperProps {
  id: string;
  icon: any;
  label: string;
  color: string;
  state?: NodeState;
  componentType?: ComponentType;
  children?: ReactNode;
  hasTopHandle?: boolean;
  hasBottomHandle?: boolean;
  hasLeftHandle?: boolean;
  hasRightHandle?: boolean;
}

/**
 * Get component type badge info
 */
function getTypeBadge(componentType?: ComponentType): { label: string; color: string; bg: string } | null {
  switch (componentType) {
    case 'cre':
      return { label: 'CRE', color: '#34d399', bg: 'rgba(52, 211, 153, 0.2)' };
    case 'solidity':
      return { label: 'SOL', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)' };
    case 'config':
      return { label: 'CFG', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.2)' };
    default:
      return null;
  }
}

export function NodeWrapper({
  id,
  icon: Icon,
  label,
  color,
  state,
  componentType,
  children,
  hasTopHandle = true,
  hasBottomHandle = true,
  hasLeftHandle = false,
  hasRightHandle = false,
}: NodeWrapperProps) {
  const typeBadge = getTypeBadge(componentType);

  // Simple border based on state
  const getBorder = () => {
    switch (state) {
      case 'ready':
        return '2px solid #10b981';
      case 'error':
        return '2px solid #ef4444';
      case 'configured':
        return '2px solid #fbbf24';
      case 'draft':
        return '2px dashed #888';
      default:
        return `2px solid ${color}`;
    }
  };

  return (
    <div
      style={{
        padding: '12px',
        background: '#1a1a2e',
        border: getBorder(),
        borderRadius: '8px',
        minWidth: '180px',
        position: 'relative',
      }}
    >
      {/* Handles */}
      {hasTopHandle && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: color,
            width: '10px',
            height: '10px',
            border: '2px solid #16213e',
          }}
        />
      )}
      {hasBottomHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: color,
            width: '10px',
            height: '10px',
            border: '2px solid #16213e',
          }}
        />
      )}
      {hasLeftHandle && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: color,
            width: '10px',
            height: '10px',
            border: '2px solid #16213e',
          }}
        />
      )}
      {hasRightHandle && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: color,
            width: '10px',
            height: '10px',
            border: '2px solid #16213e',
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Icon size={20} color={color} />
        <div style={{ fontWeight: '600', fontSize: '14px', color: '#fff' }}>
          {label}
        </div>

        {/* Status indicator */}
        {state && (state === 'ready' || state === 'error') && (
          <div
            style={{
              marginLeft: 'auto',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: state === 'ready' ? '#10b981' : '#ef4444',
            }}
          />
        )}
      </div>

      {/* Component Type Badge */}
      {typeBadge && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontSize: '9px',
            fontWeight: '600',
            color: typeBadge.color,
            background: typeBadge.bg,
            padding: '2px 6px',
            borderRadius: '3px',
            textTransform: 'uppercase',
          }}
        >
          {typeBadge.label}
        </div>
      )}

      {/* Children content */}
      {children}
    </div>
  );
}
