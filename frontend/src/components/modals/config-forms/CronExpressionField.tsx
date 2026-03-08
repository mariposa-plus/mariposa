'use client';

import { useState } from 'react';

const PRESETS = [
  { label: 'Every 30 seconds', value: '*/30 * * * * *', description: 'Runs twice per minute' },
  { label: 'Every minute', value: '0 * * * * *', description: 'Runs 60 times per hour' },
  { label: 'Every 5 minutes', value: '0 */5 * * * *', description: 'Runs 12 times per hour' },
  { label: 'Every 15 minutes', value: '0 */15 * * * *', description: 'Runs 4 times per hour' },
  { label: 'Every 30 minutes', value: '0 */30 * * * *', description: 'Runs twice per hour' },
  { label: 'Every hour', value: '0 0 * * * *', description: 'Runs 24 times per day' },
  { label: 'Every 6 hours', value: '0 0 */6 * * *', description: 'Runs 4 times per day' },
  { label: 'Every day at midnight', value: '0 0 0 * * *', description: 'Runs once per day (UTC)' },
  { label: 'Every day at 9 AM', value: '0 0 9 * * *', description: 'Runs once per day (UTC)' },
  { label: 'Every Monday at 9 AM', value: '0 0 9 * * 1', description: 'Runs once per week' },
];

interface CronExpressionFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CronExpressionField({ value, onChange, error }: CronExpressionFieldProps) {
  const isPreset = PRESETS.some((p) => p.value === value);
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>(isPreset || !value ? 'quick' : 'custom');

  const selectedPreset = PRESETS.find((p) => p.value === value);

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#fff' }}>
        Cron Expression
        <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
      </label>

      {/* Tab Buttons */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '12px', borderBottom: '1px solid #2a3f5f' }}>
        <button
          type="button"
          onClick={() => setActiveTab('quick')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'quick' ? '2px solid #7c3aed' : '2px solid transparent',
            color: activeTab === 'quick' ? '#fff' : '#888',
            fontSize: '13px',
            fontWeight: activeTab === 'quick' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Quick Select
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'custom' ? '2px solid #7c3aed' : '2px solid transparent',
            color: activeTab === 'custom' ? '#fff' : '#888',
            fontSize: '13px',
            fontWeight: activeTab === 'custom' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Custom
        </button>
      </div>

      {/* Quick Select Mode */}
      {activeTab === 'quick' && (
        <div>
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1a1a2e',
              border: error ? '1px solid #ef4444' : '1px solid #2a3f5f',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Select a schedule...</option>
            {PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
          {selectedPreset && (
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#888' }}>
              {selectedPreset.description}
            </div>
          )}
        </div>
      )}

      {/* Custom Mode */}
      {activeTab === 'custom' && (
        <div>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0 */5 * * * *"
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1a1a2e',
              border: error ? '1px solid #ef4444' : '1px solid #2a3f5f',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: '"Fira Code", "Courier New", monospace',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
          {/* Format helper */}
          <div style={{
            marginTop: '8px',
            display: 'flex',
            gap: '4px',
            justifyContent: 'space-between',
            padding: '6px 12px',
            background: '#1a1a2e',
            borderRadius: '4px',
            border: '1px solid #2a3f5f',
          }}>
            {['SEC', 'MIN', 'HOUR', 'DAY', 'MONTH', 'DOW'].map((field) => (
              <span key={field} style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600', fontFamily: 'monospace', textAlign: 'center', flex: 1 }}>
                {field}
              </span>
            ))}
          </div>
          <div style={{ marginTop: '6px', fontSize: '12px', color: '#888', lineHeight: '1.5' }}>
            Examples: <code style={{ color: '#a78bfa' }}>0 */5 * * * *</code> (every 5 min), <code style={{ color: '#a78bfa' }}>0 0 9 * * 1</code> (Mon 9 AM)
          </div>
        </div>
      )}

      {/* Current Expression Display */}
      <div style={{
        marginTop: '10px',
        padding: '8px 12px',
        background: '#0d0d1a',
        borderRadius: '6px',
        border: '1px solid #2a3f5f',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '12px', color: '#888' }}>Expression:</span>
        <code style={{ fontSize: '13px', color: '#34d399', fontFamily: '"Fira Code", "Courier New", monospace' }}>
          {value || '(not set)'}
        </code>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '6px',
          padding: '8px 10px',
          background: '#ef444420',
          border: '1px solid #ef4444',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#ef4444',
        }}>
          {error}
        </div>
      )}

      {/* Help text */}
      {!error && (
        <div style={{ marginTop: '6px', fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
          CRE cron format: sec min hour day month weekday
        </div>
      )}
    </div>
  );
}
