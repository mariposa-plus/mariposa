'use client';

import React from 'react';
import { Play, Square, AlertCircle, Loader } from 'lucide-react';

interface PipelineStatusBadgeProps {
  status: 'stopped' | 'activating' | 'active' | 'executing' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
}

export function PipelineStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  showText = true,
}: PipelineStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'stopped':
        return {
          label: 'Stopped',
          color: 'rgb(107, 114, 128)', // gray-500
          bgColor: 'rgba(107, 114, 128, 0.1)',
          Icon: Square,
          animation: '',
        };
      case 'activating':
        return {
          label: 'Activating...',
          color: 'rgb(245, 158, 11)', // amber-500
          bgColor: 'rgba(245, 158, 11, 0.1)',
          Icon: Loader,
          animation: 'spin',
        };
      case 'active':
        return {
          label: 'Active',
          color: 'rgb(34, 197, 94)', // green-500
          bgColor: 'rgba(34, 197, 94, 0.1)',
          Icon: Play,
          animation: 'pulse',
        };
      case 'executing':
        return {
          label: 'Executing',
          color: 'rgb(59, 130, 246)', // blue-500
          bgColor: 'rgba(59, 130, 246, 0.1)',
          Icon: Loader,
          animation: 'spin',
        };
      case 'error':
        return {
          label: 'Error',
          color: 'rgb(239, 68, 68)', // red-500
          bgColor: 'rgba(239, 68, 68, 0.1)',
          Icon: AlertCircle,
          animation: '',
        };
      default:
        return {
          label: 'Unknown',
          color: 'rgb(107, 114, 128)',
          bgColor: 'rgba(107, 114, 128, 0.1)',
          Icon: Square,
          animation: '',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '4px 8px',
          fontSize: '12px',
          gap: '4px',
          iconSize: 12,
        };
      case 'lg':
        return {
          padding: '10px 16px',
          fontSize: '16px',
          gap: '8px',
          iconSize: 20,
        };
      default: // md
        return {
          padding: '6px 12px',
          fontSize: '14px',
          gap: '6px',
          iconSize: 16,
        };
    }
  };

  const config = getStatusConfig();
  const sizeStyles = getSizeStyles();
  const { Icon } = config;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${sizeStyles.gap}px`,
        padding: sizeStyles.padding,
        borderRadius: '6px',
        backgroundColor: config.bgColor,
        color: config.color,
        fontSize: sizeStyles.fontSize,
        fontWeight: 500,
        border: `1px solid ${config.color}20`,
      }}
    >
      {showIcon && (
        <Icon
          size={sizeStyles.iconSize}
          style={{
            animation:
              config.animation === 'spin'
                ? 'spin 1s linear infinite'
                : config.animation === 'pulse'
                  ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  : 'none',
          }}
        />
      )}
      {showText && <span>{config.label}</span>}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
