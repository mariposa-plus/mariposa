'use client';

import { useState } from 'react';
import { Check, X, Clipboard } from 'lucide-react';

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const PARTIAL_HEX_REGEX = /^0x[a-fA-F0-9]*$/;

interface ContractAddressFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ContractAddressField({ value, onChange, error }: ContractAddressFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [pasteMessage, setPasteMessage] = useState(false);

  const addr = value || '';
  const isValid = ADDRESS_REGEX.test(addr);
  const isPartialValid = PARTIAL_HEX_REGEX.test(addr);
  const showValidation = addr.length > 0;
  const showInvalid = showValidation && !isValid && (addr.length >= 42 || (!isPartialValid && addr.length > 2));

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      onChange(trimmed);
      setPasteMessage(true);
      setTimeout(() => setPasteMessage(false), 1500);
    } catch {
      // Clipboard access denied — ignore
    }
  };

  const borderColor = error
    ? '#ef4444'
    : isValid
    ? '#10b981'
    : showInvalid
    ? '#ef4444'
    : isFocused
    ? '#3b82f6'
    : '#2a3f5f';

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Label */}
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#fff' }}>
        Contract Address
        <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
      </label>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={addr}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0x..."
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              width: '100%',
              padding: '10px 36px 10px 12px',
              background: '#1a1a2e',
              border: `1px solid ${borderColor}`,
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: '"Fira Code", "Courier New", monospace',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
          {/* Validation icon */}
          {showValidation && (
            <div style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
            }}>
              {isValid ? (
                <Check size={16} style={{ color: '#10b981' }} />
              ) : showInvalid ? (
                <X size={16} style={{ color: '#ef4444' }} />
              ) : null}
            </div>
          )}
        </div>

        {/* Paste button */}
        <button
          type="button"
          onClick={handlePaste}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 12px',
            background: '#2a3f5f',
            border: 'none',
            borderRadius: '6px',
            color: pasteMessage ? '#10b981' : '#ccc',
            fontSize: '13px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'color 0.2s',
          }}
        >
          <Clipboard size={14} />
          {pasteMessage ? 'Pasted!' : 'Paste'}
        </button>
      </div>

      {/* Character count */}
      <div style={{ marginTop: '6px', fontSize: '12px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
        <span>
          {isValid
            ? 'Valid Ethereum address'
            : showInvalid
            ? 'Invalid address format (expected 0x + 40 hex characters)'
            : 'Address of the IReceiver consumer contract'}
        </span>
        <span style={{ fontFamily: 'monospace' }}>{addr.length}/42</span>
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
    </div>
  );
}
