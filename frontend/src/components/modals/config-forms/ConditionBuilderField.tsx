'use client';

import { useState } from 'react';
import { Plus, X, Code, Wand2 } from 'lucide-react';

interface ConditionBuilderFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

type ConditionMode = 'simple' | 'code';

interface ConditionRow {
  field: string;
  operator: string;
  value: string;
}

interface ConditionMeta {
  mode: 'simple';
  conditions: ConditionRow[];
  logic: 'and' | 'or';
}

const METADATA_PREFIX = '/* @mariposa-condition ';
const METADATA_SUFFIX = ' */\n';

// Operators grouped by category
const OPERATOR_GROUPS = [
  {
    label: 'Numbers',
    operators: [
      { value: '>', label: '> greater than' },
      { value: '<', label: '< less than' },
      { value: '>=', label: '>= greater or equal' },
      { value: '<=', label: '<= less or equal' },
      { value: '==', label: '== equals' },
      { value: '!=', label: '!= not equal' },
    ],
  },
  {
    label: 'Text',
    operators: [
      { value: 'contains', label: 'contains' },
      { value: 'startsWith', label: 'starts with' },
      { value: 'endsWith', label: 'ends with' },
      { value: 'matches', label: 'matches (regex)' },
    ],
  },
  {
    label: 'Boolean',
    operators: [
      { value: 'is true', label: 'is true' },
      { value: 'is false', label: 'is false' },
    ],
  },
  {
    label: 'Existence',
    operators: [
      { value: 'exists', label: 'exists (not null)' },
      { value: 'is empty', label: 'is empty' },
    ],
  },
];

const ALL_OPERATORS = OPERATOR_GROUPS.flatMap(g => g.operators);

// Operators that don't need a value input
const NO_VALUE_OPERATORS = ['is true', 'is false', 'exists', 'is empty'];

const QUICK_INSERTS = [
  { label: 'data.', text: 'data.' },
  { label: '&&', text: ' && ' },
  { label: '||', text: ' || ' },
  { label: '> 0', text: ' > 0' },
  { label: '=== true', text: ' === true' },
  { label: '!== null', text: ' !== null' },
];

function quoteValue(val: string): string {
  return `'${val.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function generateExpression(conditions: ConditionRow[], logic: 'and' | 'or'): string {
  if (conditions.length === 0) return 'return false;';

  const joiner = logic === 'and' ? ' && ' : ' || ';
  const parts = conditions.map((c) => {
    const field = c.field || 'data.value';
    switch (c.operator) {
      case 'contains':
        return `String(${field}).includes(${quoteValue(c.value)})`;
      case 'startsWith':
        return `String(${field}).startsWith(${quoteValue(c.value)})`;
      case 'endsWith':
        return `String(${field}).endsWith(${quoteValue(c.value)})`;
      case 'matches':
        return `new RegExp(${quoteValue(c.value)}).test(String(${field}))`;
      case 'is true':
        return `!!${field}`;
      case 'is false':
        return `!${field}`;
      case 'exists':
        return `${field} != null`;
      case 'is empty':
        return `${field} == null || ${field} === ''`;
      default:
        return `${field} ${c.operator} ${c.value}`;
    }
  });

  return `return ${parts.join(joiner)};`;
}

function serializeCondition(meta: ConditionMeta): string {
  const json = JSON.stringify(meta);
  const expression = generateExpression(meta.conditions, meta.logic);
  return `${METADATA_PREFIX}${json}${METADATA_SUFFIX}${expression}`;
}

function parseCondition(raw: string): { meta: ConditionMeta | null; expression: string } {
  if (!raw) {
    return { meta: null, expression: '' };
  }

  if (raw.startsWith(METADATA_PREFIX)) {
    const suffixIdx = raw.indexOf(METADATA_SUFFIX);
    if (suffixIdx !== -1) {
      const jsonStr = raw.slice(METADATA_PREFIX.length, suffixIdx);
      try {
        const meta = JSON.parse(jsonStr) as ConditionMeta;
        const expression = raw.slice(suffixIdx + METADATA_SUFFIX.length);
        return { meta, expression };
      } catch {
        // Fall through to code mode
      }
    }
  }

  return { meta: null, expression: raw };
}

// Styles (matching DataTransformField patterns)
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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

const smallBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 10px',
  background: '#2a3f5f',
  border: 'none',
  borderRadius: '4px',
  color: '#ccc',
  fontSize: '12px',
  cursor: 'pointer',
};

export function ConditionBuilderField({ value, onChange, error }: ConditionBuilderFieldProps) {
  const parsed = parseCondition(value || '');
  const initialMode: ConditionMode = parsed.meta ? 'simple' : (value ? 'code' : 'simple');
  const initialConditions: ConditionRow[] = parsed.meta?.conditions || [{ field: 'data.', operator: '>', value: '' }];
  const initialLogic = parsed.meta?.logic || 'and';

  const [activeMode, setActiveMode] = useState<ConditionMode>(initialMode);
  const [conditions, setConditions] = useState<ConditionRow[]>(initialConditions);
  const [logic, setLogic] = useState<'and' | 'or'>(initialLogic);
  const [codeValue, setCodeValue] = useState(parsed.expression || '');
  const [showConfirmSwitch, setShowConfirmSwitch] = useState(false);

  const updateSimple = (newConditions: ConditionRow[], newLogic: 'and' | 'or') => {
    setConditions(newConditions);
    setLogic(newLogic);
    const meta: ConditionMeta = { mode: 'simple', conditions: newConditions, logic: newLogic };
    onChange(serializeCondition(meta));
  };

  const updateCode = (code: string) => {
    setCodeValue(code);
    onChange(code);
  };

  const switchToCode = () => {
    const expression = activeMode === 'simple' ? generateExpression(conditions, logic) : codeValue;
    setCodeValue(expression);
    setActiveMode('code');
    onChange(expression);
  };

  const switchToSimple = () => {
    if (codeValue.trim() && activeMode === 'code') {
      setShowConfirmSwitch(true);
      return;
    }
    setActiveMode('simple');
    const newConditions: ConditionRow[] = [{ field: 'data.', operator: '>', value: '' }];
    setConditions(newConditions);
    setLogic('and');
    const meta: ConditionMeta = { mode: 'simple', conditions: newConditions, logic: 'and' };
    onChange(serializeCondition(meta));
  };

  const confirmSwitchToSimple = () => {
    setShowConfirmSwitch(false);
    setActiveMode('simple');
    const newConditions: ConditionRow[] = [{ field: 'data.', operator: '>', value: '' }];
    setConditions(newConditions);
    setLogic('and');
    const meta: ConditionMeta = { mode: 'simple', conditions: newConditions, logic: 'and' };
    onChange(serializeCondition(meta));
  };

  const updateCondition = (index: number, patch: Partial<ConditionRow>) => {
    const updated = conditions.map((c, i) => (i === index ? { ...c, ...patch } : c));
    updateSimple(updated, logic);
  };

  const addCondition = () => {
    updateSimple([...conditions, { field: 'data.', operator: '>', value: '' }], logic);
  };

  const removeCondition = (index: number) => {
    const updated = conditions.filter((_, i) => i !== index);
    updateSimple(updated.length > 0 ? updated : [{ field: 'data.', operator: '>', value: '' }], logic);
  };

  const previewExpression = activeMode === 'simple' ? generateExpression(conditions, logic) : codeValue;

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Label */}
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#fff' }}>
        Condition Expression
        <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
      </label>

      {/* Mode toggle */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2a3f5f', marginBottom: '12px' }}>
        <button
          type="button"
          onClick={() => activeMode === 'code' ? switchToSimple() : null}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeMode === 'simple' ? '2px solid #7c3aed' : '2px solid transparent',
            color: activeMode === 'simple' ? '#fff' : '#888',
            fontSize: '13px',
            fontWeight: activeMode === 'simple' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Wand2 size={14} />
          Simple
        </button>
        <button
          type="button"
          onClick={switchToCode}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeMode === 'code' ? '2px solid #7c3aed' : '2px solid transparent',
            color: activeMode === 'code' ? '#fff' : '#888',
            fontSize: '13px',
            fontWeight: activeMode === 'code' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Code size={14} />
          Code
        </button>
      </div>

      {/* Confirmation dialog for switching to Simple */}
      {showConfirmSwitch && (
        <div style={{
          padding: '12px',
          marginBottom: '12px',
          background: '#ef444415',
          border: '1px solid #ef444460',
          borderRadius: '6px',
        }}>
          <div style={{ fontSize: '13px', color: '#fca5a5', marginBottom: '8px' }}>
            Switching to Simple mode will replace your custom code. Continue?
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={confirmSwitchToSimple} style={{ ...smallBtnStyle, background: '#ef4444', color: '#fff' }}>
              Switch to Simple
            </button>
            <button type="button" onClick={() => setShowConfirmSwitch(false)} style={smallBtnStyle}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ====== SIMPLE MODE ====== */}
      {activeMode === 'simple' && (
        <div>
          {/* IF label */}
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            If
          </div>

          {/* Condition rows */}
          <div style={{
            padding: '12px',
            background: '#0d0d1a',
            border: '1px solid #2a3f5f',
            borderRadius: '6px',
            marginBottom: '12px',
          }}>
            {conditions.map((condition, index) => (
              <div key={index}>
                {/* Logic joiner between rows */}
                {index > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#2a3f5f' }} />
                    <select
                      value={logic}
                      onChange={(e) => updateSimple(conditions, e.target.value as 'and' | 'or')}
                      style={{
                        padding: '2px 8px',
                        background: '#2a3f5f',
                        border: 'none',
                        borderRadius: '3px',
                        color: '#7c3aed',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        margin: '0 8px',
                      }}
                    >
                      <option value="and">AND</option>
                      <option value="or">OR</option>
                    </select>
                    <div style={{ flex: 1, height: '1px', background: '#2a3f5f' }} />
                  </div>
                )}

                {/* Condition row */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {/* Field */}
                  <input
                    type="text"
                    value={condition.field}
                    onChange={(e) => updateCondition(index, { field: e.target.value })}
                    placeholder="data.price"
                    style={{ ...inputStyle, flex: 2 }}
                  />

                  {/* Operator */}
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(index, { operator: e.target.value })}
                    style={{ ...selectStyle, flex: 1.2 }}
                  >
                    {OPERATOR_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.operators.map((op) => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  {/* Value (hidden for boolean/existence operators) */}
                  {!NO_VALUE_OPERATORS.includes(condition.operator) && (
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) => updateCondition(index, { value: e.target.value })}
                      placeholder="1000"
                      style={{ ...inputStyle, flex: 1.5 }}
                    />
                  )}

                  {/* Remove button */}
                  {conditions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add condition button */}
            <button
              type="button"
              onClick={addCondition}
              style={{ ...smallBtnStyle, marginTop: '10px' }}
            >
              <Plus size={12} /> Add condition
            </button>
          </div>

          {/* Preview */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Preview</label>
            <pre style={{
              padding: '10px 12px',
              background: '#1a1a2e',
              border: '1px solid #2a3f5f',
              borderRadius: '6px',
              color: '#34d399',
              fontSize: '12px',
              fontFamily: '"Fira Code", "Courier New", monospace',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {previewExpression || '// Configure conditions above'}
            </pre>
          </div>
        </div>
      )}

      {/* ====== CODE MODE ====== */}
      {activeMode === 'code' && (
        <div>
          <textarea
            value={codeValue}
            onChange={(e) => updateCode(e.target.value)}
            placeholder={'// Return true or false\nreturn data.price > 1000;'}
            rows={8}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1a1a2e',
              border: error ? '1px solid #ef4444' : '1px solid #2a3f5f',
              borderRadius: '6px',
              color: '#34d399',
              fontSize: '13px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: '"Fira Code", "Courier New", monospace',
              transition: 'border-color 0.2s',
              lineHeight: '1.5',
            }}
          />

          {/* Quick insert buttons */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: '#888', lineHeight: '26px' }}>Quick Insert:</span>
            {QUICK_INSERTS.map((qi) => (
              <button
                key={qi.label}
                type="button"
                onClick={() => updateCode(codeValue + qi.text)}
                style={smallBtnStyle}
              >
                {qi.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help text */}
      {!error && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
          {activeMode === 'simple'
            ? 'Build conditions visually, or switch to Code mode for full JavaScript control.'
            : 'JavaScript expression returning true/false. Access input via "data".'}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '8px',
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
