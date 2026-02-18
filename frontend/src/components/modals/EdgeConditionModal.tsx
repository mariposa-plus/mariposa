'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Lock, Zap, AlertCircle } from 'lucide-react';
import { EdgeCondition, EdgeConditionType } from '@/types';

interface EdgeConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (condition: EdgeCondition) => void;
  initialCondition?: EdgeCondition;
  edgeId: string;
}

export function EdgeConditionModal({
  isOpen,
  onClose,
  onSave,
  initialCondition,
  edgeId,
}: EdgeConditionModalProps) {
  const [conditionType, setConditionType] = useState<EdgeConditionType>(
    initialCondition?.type || 'immediate'
  );
  const [delayValue, setDelayValue] = useState<number>(
    initialCondition?.delayValue || 1
  );
  const [delayUnit, setDelayUnit] = useState<'seconds' | 'minutes' | 'hours' | 'days'>(
    initialCondition?.delayUnit || 'minutes'
  );
  const [minApprovals, setMinApprovals] = useState<number>(
    initialCondition?.approvalConfig?.minApprovals || 1
  );
  const [approvalMessage, setApprovalMessage] = useState<string>(
    initialCondition?.approvalConfig?.message || ''
  );

  useEffect(() => {
    if (initialCondition) {
      setConditionType(initialCondition.type);
      setDelayValue(initialCondition.delayValue || 1);
      setDelayUnit(initialCondition.delayUnit || 'minutes');
      setMinApprovals(initialCondition.approvalConfig?.minApprovals || 1);
      setApprovalMessage(initialCondition.approvalConfig?.message || '');
    }
  }, [initialCondition]);

  const handleSave = () => {
    const delayUnitMs = {
      seconds: 1000,
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };

    const condition: EdgeCondition = {
      type: conditionType,
    };

    if (conditionType === 'delay') {
      condition.delayMs = delayValue * delayUnitMs[delayUnit];
      condition.delayValue = delayValue;
      condition.delayUnit = delayUnit;
    }

    if (conditionType === 'approval') {
      condition.approvalConfig = {
        required: true,
        minApprovals,
        message: approvalMessage || `Approval required for ${edgeId}`,
      };
    }

    onSave(condition);
    onClose();
  };

  if (!isOpen) return null;

  const conditionTypes = [
    { value: 'immediate', label: 'Immediate', icon: Zap, color: '#10b981', description: 'Execute next node immediately' },
    { value: 'delay', label: 'Delay', icon: Clock, color: '#fbbf24', description: 'Wait before executing next node' },
    { value: 'approval', label: 'Approval', icon: Lock, color: '#ef4444', description: 'Require manual approval' },
    { value: 'event', label: 'Event', icon: AlertCircle, color: '#8b5cf6', description: 'Wait for specific event (coming soon)' },
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
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '12px',
          padding: '24px',
          width: '500px',
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
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Edge Condition</h2>
          <button
            onClick={onClose}
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

        {/* Condition Type Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            Condition Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {conditionTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = conditionType === type.value;
              const isDisabled = type.value === 'event'; // Event type not yet implemented

              return (
                <button
                  key={type.value}
                  onClick={() => !isDisabled && setConditionType(type.value as EdgeConditionType)}
                  disabled={isDisabled}
                  style={{
                    padding: '12px',
                    background: isSelected ? `${type.color}20` : '#16213e',
                    border: `2px solid ${isSelected ? type.color : '#2a3f5f'}`,
                    borderRadius: '8px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: isDisabled ? 0.5 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={18} color={type.color} />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{type.label}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#888', textAlign: 'left' }}>{type.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Delay Configuration */}
        {conditionType === 'delay' && (
          <div style={{ marginBottom: '24px', padding: '16px', background: '#16213e', borderRadius: '8px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              Delay Duration
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="number"
                min="1"
                value={delayValue}
                onChange={(e) => setDelayValue(parseInt(e.target.value) || 1)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#1a1a2e',
                  border: '1px solid #2a3f5f',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <select
                value={delayUnit}
                onChange={(e) => setDelayUnit(e.target.value as any)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#1a1a2e',
                  border: '1px solid #2a3f5f',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              >
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>
        )}

        {/* Approval Configuration */}
        {conditionType === 'approval' && (
          <div style={{ marginBottom: '24px', padding: '16px', background: '#16213e', borderRadius: '8px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Minimum Approvals Required
              </label>
              <input
                type="number"
                min="1"
                value={minApprovals}
                onChange={(e) => setMinApprovals(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1a1a2e',
                  border: '1px solid #2a3f5f',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Approval Message (Optional)
              </label>
              <textarea
                value={approvalMessage}
                onChange={(e) => setApprovalMessage(e.target.value)}
                placeholder="Enter a message for approvers..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1a1a2e',
                  border: '1px solid #2a3f5f',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
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
            onClick={handleSave}
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
            Save Condition
          </button>
        </div>
      </div>
    </div>
  );
}
