'use client';

import React from 'react';
import { Play, Square, Loader } from 'lucide-react';

interface PipelineActivateButtonProps {
  isActive: boolean;
  status: 'stopped' | 'activating' | 'active' | 'executing' | 'error';
  isActivating: boolean;
  isDeactivating: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  disabled?: boolean;
}

export function PipelineActivateButton({
  isActive,
  status,
  isActivating,
  isDeactivating,
  onActivate,
  onDeactivate,
  disabled = false,
}: PipelineActivateButtonProps) {
  const isLoading = isActivating || isDeactivating;
  const canActivate = !isActive && status === 'stopped';
  const canDeactivate = isActive && (status === 'active' || status === 'activating');

  const handleClick = () => {
    if (isLoading || disabled) return;

    if (canActivate) {
      onActivate();
    } else if (canDeactivate) {
      onDeactivate();
    }
  };

  const getButtonConfig = () => {
    if (isActivating) {
      return {
        label: 'Activating...',
        Icon: Loader,
        bgColor: 'rgb(245, 158, 11)', // amber-500
        hoverColor: 'rgb(217, 119, 6)', // amber-600
        spin: true,
      };
    }
    if (isDeactivating) {
      return {
        label: 'Stopping...',
        Icon: Loader,
        bgColor: 'rgb(239, 68, 68)', // red-500
        hoverColor: 'rgb(220, 38, 38)', // red-600
        spin: true,
      };
    }
    if (canActivate) {
      return {
        label: 'Activate Pipeline',
        Icon: Play,
        bgColor: 'rgb(34, 197, 94)', // green-500
        hoverColor: 'rgb(22, 163, 74)', // green-600
        spin: false,
      };
    }
    if (canDeactivate) {
      return {
        label: 'Deactivate Pipeline',
        Icon: Square,
        bgColor: 'rgb(239, 68, 68)', // red-500
        hoverColor: 'rgb(220, 38, 38)', // red-600
        spin: false,
      };
    }
    return {
      label: 'Pipeline Active',
      Icon: Play,
      bgColor: 'rgb(107, 114, 128)', // gray-500
      hoverColor: 'rgb(107, 114, 128)',
      spin: false,
    };
  };

  const config = getButtonConfig();
  const { Icon } = config;
  const isDisabled = disabled || isLoading || (!canActivate && !canDeactivate);

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderRadius: '8px',
        backgroundColor: config.bgColor,
        color: 'white',
        fontSize: '14px',
        fontWeight: 600,
        border: 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = config.hoverColor;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = config.bgColor;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      }}
    >
      <Icon
        size={18}
        style={{
          animation: config.spin ? 'spin 1s linear infinite' : 'none',
        }}
      />
      <span>{config.label}</span>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  );
}
