'use client';

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow';
import { Clock, Lock, Zap, AlertCircle } from 'lucide-react';
import { EdgeConditionType } from '@/types';

export interface ConditionalEdgeData {
  condition?: {
    type: EdgeConditionType;
    delayMs?: number;
    delayValue?: number;
    delayUnit?: string;
    approvalConfig?: {
      minApprovals?: number;
      approvers?: string[];
    };
  };
  onEdgeClick?: (edgeId: string) => void;
}

export function ConditionalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
}: EdgeProps<ConditionalEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const conditionType = data?.condition?.type || 'immediate';

  // Icon and color based on condition type
  const getConditionDisplay = () => {
    switch (conditionType) {
      case 'delay':
        return {
          icon: Clock,
          color: '#fbbf24',
          label: data?.condition?.delayValue && data?.condition?.delayUnit
            ? `${data.condition.delayValue}${data.condition.delayUnit[0]}`
            : 'Delay',
        };
      case 'approval':
        return {
          icon: Lock,
          color: '#ef4444',
          label: data?.condition?.approvalConfig?.minApprovals
            ? `${data.condition.approvalConfig.minApprovals} approval${data.condition.approvalConfig.minApprovals > 1 ? 's' : ''}`
            : 'Approval',
        };
      case 'event':
        return {
          icon: AlertCircle,
          color: '#8b5cf6',
          label: 'Event',
        };
      case 'immediate':
      default:
        return {
          icon: Zap,
          color: '#10b981',
          label: null,
        };
    }
  };

  const { icon: Icon, color, label } = getConditionDisplay();

  // Only show label for non-immediate conditions
  const showLabel = conditionType !== 'immediate';

  // Edge styling based on condition
  const edgeStyle = {
    ...style,
    stroke: color,
    strokeWidth: 2,
    strokeDasharray: conditionType === 'immediate' ? '0' : '5,5',
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      {showLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            <button
              onClick={() => data?.onEdgeClick?.(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#1a1a2e',
                border: `2px solid ${color}`,
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: color,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
              }}
            >
              <Icon size={12} />
              <span>{label}</span>
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
