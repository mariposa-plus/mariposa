'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface HeaderRow {
  key: string;
  value: string;
}

interface HeadersBuilderProps {
  value: any;
  onChange: (value: Record<string, string>) => void;
  error?: string;
}

function parseHeaders(value: any): HeaderRow[] {
  try {
    const obj = typeof value === 'string' ? JSON.parse(value) : value;
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const entries = Object.entries(obj);
      if (entries.length > 0) {
        return entries.map(([key, val]) => ({ key, value: String(val) }));
      }
    }
  } catch {
    // not valid JSON
  }
  return [{ key: '', value: '' }];
}

function serializeHeaders(rows: HeaderRow[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const row of rows) {
    if (row.key.trim()) {
      result[row.key.trim()] = row.value;
    }
  }
  return result;
}

export function HeadersBuilder({ value, onChange, error }: HeadersBuilderProps) {
  const [rows, setRows] = useState<HeaderRow[]>(() => parseHeaders(value));

  useEffect(() => {
    setRows(parseHeaders(value));
  }, []);

  const updateRows = (newRows: HeaderRow[]) => {
    setRows(newRows);
    onChange(serializeHeaders(newRows));
  };

  const handleRowChange = (index: number, field: 'key' | 'value', val: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: val };
    updateRows(newRows);
  };

  const addRow = (key = '', headerValue = '') => {
    updateRows([...rows, { key, value: headerValue }]);
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    if (newRows.length === 0) {
      updateRows([{ key: '', value: '' }]);
    } else {
      updateRows(newRows);
    }
  };

  const presets = [
    { label: 'JSON', key: 'Content-Type', value: 'application/json' },
    { label: 'Bearer Auth', key: 'Authorization', value: 'Bearer {{secrets.TOKEN}}' },
    { label: 'API Key', key: 'X-API-Key', value: '{{secrets.API_KEY}}' },
  ];

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px 10px',
    background: '#1a1a2e',
    border: '1px solid #2a3f5f',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'monospace',
  };

  return (
    <div>
      {/* Label */}
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#fff' }}>
        Headers
      </label>

      {/* Header rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
        {rows.map((row, index) => (
          <div key={index} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="text"
              value={row.key}
              onChange={(e) => handleRowChange(index, 'key', e.target.value)}
              placeholder="Header name"
              style={inputStyle}
            />
            <input
              type="text"
              value={row.value}
              onChange={(e) => handleRowChange(index, 'value', e.target.value)}
              placeholder="Value"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
              title="Remove header"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={() => addRow()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'transparent',
          border: '1px solid #2a3f5f',
          borderRadius: '4px',
          color: '#3b82f6',
          fontSize: '13px',
          cursor: 'pointer',
          marginBottom: '10px',
        }}
      >
        <Plus size={14} />
        Add Header
      </button>

      {/* Quick-add presets */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => addRow(preset.key, preset.value)}
            style={{
              padding: '4px 10px',
              background: '#2a3f5f',
              border: 'none',
              borderRadius: '4px',
              color: '#ccc',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            + {preset.label}
          </button>
        ))}
      </div>

      {/* Help text */}
      {!error && (
        <div style={{ marginTop: '6px', fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
          HTTP request headers
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: '6px',
            padding: '8px 10px',
            background: '#ef444420',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
