'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Variable } from 'lucide-react';

export interface AvailableVariable {
  id: string;
  label: string;
  type: string;
  sourceNode: string;
}

interface PromptTemplateFieldProps {
  value: string;
  onChange: (value: string) => void;
  availableVariables: AvailableVariable[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
}

export function PromptTemplateField({
  value,
  onChange,
  availableVariables,
  placeholder,
  label,
  required,
  helpText,
  error,
}: PromptTemplateFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert variable at cursor position
  const insertVariable = (variableName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value || '';
    const before = text.substring(0, start);
    const after = text.substring(end);

    const variableTag = `{{${variableName}}}`;
    const newValue = before + variableTag + after;

    onChange(newValue);
    setShowVariableMenu(false);

    // Set cursor position after inserted variable
    setTimeout(() => {
      const newPosition = start + variableTag.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  // Highlight {{variables}} in the text
  const highlightVariables = (text: string) => {
    if (!text) return null;

    const parts = text.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, index) => {
      if (part.match(/^\{\{[^}]+\}\}$/)) {
        const varName = part.slice(2, -2);
        const isValid = availableVariables.some(v => v.id === varName);
        return (
          <span
            key={index}
            style={{
              background: isValid ? '#3b82f620' : '#ef444420',
              color: isValid ? '#60a5fa' : '#ef4444',
              padding: '2px 4px',
              borderRadius: '3px',
              fontWeight: '600',
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Label */}
      {label && (
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#fff' }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Textarea */}
        <div style={{ flex: 1 }}>
          <textarea
            ref={textareaRef}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={8}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1a1a2e',
              border: error ? '1px solid #ef4444' : isFocused ? '1px solid #3b82f6' : '1px solid #2a3f5f',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'monospace',
              transition: 'border-color 0.2s',
            }}
          />

          {/* Preview with highlighted variables */}
          {value && (
            <div
              style={{
                marginTop: '8px',
                padding: '10px 12px',
                background: '#0a0a14',
                border: '1px solid #2a3f5f',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#888',
                fontFamily: 'monospace',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {highlightVariables(value)}
            </div>
          )}
        </div>

        {/* Variable Picker Sidebar */}
        <div
          style={{
            width: '240px',
            background: '#1a1a2e',
            border: '1px solid #2a3f5f',
            borderRadius: '6px',
            padding: '12px',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Variable size={16} color="#888" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase' }}>
              Available Variables
            </span>
          </div>

          {availableVariables.length === 0 ? (
            <div style={{ padding: '20px 8px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
              No variables available.
              <br />
              <br />
              Connect upstream nodes and map their outputs in the Input tab.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {availableVariables.map((variable) => (
                <button
                  key={variable.id}
                  onClick={() => insertVariable(variable.id)}
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '8px',
                    background: '#0a0a14',
                    border: '1px solid #2a3f5f',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2a3f5f30';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0a0a14';
                    e.currentTarget.style.borderColor = '#2a3f5f';
                  }}
                >
                  <Plus size={14} color="#60a5fa" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#fff',
                        fontFamily: 'monospace',
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {`{{${variable.id}}}`}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                      {variable.label}
                    </div>
                    <div style={{ fontSize: '10px', color: '#888' }}>
                      from {variable.sourceNode} • {variable.type}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      {helpText && !error && (
        <div style={{ marginTop: '6px', fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
          {helpText}
        </div>
      )}

      {/* Error Message */}
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
