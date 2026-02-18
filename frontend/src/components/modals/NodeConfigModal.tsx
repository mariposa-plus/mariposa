'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  color: string;
  icon: ReactNode;
  children: ReactNode;
}

export function NodeConfigModal({
  isOpen,
  onClose,
  title,
  color,
  icon,
  children,
}: NodeConfigModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: `0 20px 60px ${color}40`,
          border: `1px solid ${color}30`,
          animation: 'slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
            borderBottom: `2px solid ${color}30`,
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${color}30, ${color}50)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#fff',
                margin: 0,
              }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#aaa',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#aaa';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
