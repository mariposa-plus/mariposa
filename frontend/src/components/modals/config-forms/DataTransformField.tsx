'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X, Play, ChevronDown, BookOpen, Code, Wand2 } from 'lucide-react';
import {
  TransformMeta,
  TransformOperation,
  TransformTemplate,
  TRANSFORM_TEMPLATES,
  generateExpression,
  serializeTransform,
  parseTransform,
} from './dataTransformTemplates';

interface DataTransformFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

type ActiveMode = 'simple' | 'code';

const OPERATIONS: Array<{ value: TransformOperation; label: string; description: string }> = [
  { value: 'extract-single', label: 'Extract a value', description: 'Pull a single field from the data' },
  { value: 'extract-multiple', label: 'Extract multiple values', description: 'Pull several fields at once' },
  { value: 'format-text', label: 'Format text', description: 'Build a text string using {{field}} placeholders' },
  { value: 'math', label: 'Math operation', description: 'Perform arithmetic on a numeric field' },
  { value: 'compare', label: 'Compare values', description: 'Check a field against a value (returns true/false)' },
  { value: 'rename-fields', label: 'Rename fields', description: 'Map old field names to new ones' },
];

const MATH_OPS = [
  { value: '+', label: 'Add (+)' },
  { value: '-', label: 'Subtract (-)' },
  { value: '*', label: 'Multiply (*)' },
  { value: '/', label: 'Divide (/)' },
  { value: '%', label: 'Modulo (%)' },
];

const COMPARE_OPS = [
  { value: '==', label: 'Equals (==)' },
  { value: '!=', label: 'Not equal (!=)' },
  { value: '>', label: 'Greater than (>)' },
  { value: '<', label: 'Less than (<)' },
  { value: '>=', label: 'Greater or equal (>=)' },
  { value: '<=', label: 'Less or equal (<=)' },
];

const QUICK_INSERTS = [
  { label: 'data.', text: 'data.' },
  { label: 'return {}', text: 'return {};' },
  { label: 'JSON.parse()', text: 'JSON.parse()' },
  { label: 'Math.round()', text: 'Math.round()' },
];

function getDefaultMeta(operation: TransformOperation): TransformMeta {
  const base: TransformMeta = { mode: 'simple', operation };
  switch (operation) {
    case 'extract-single':
      return { ...base, fieldPath: '', outputName: '' };
    case 'extract-multiple':
      return { ...base, extractions: [{ fieldPath: '', outputName: '' }] };
    case 'format-text':
      return { ...base, template: '' };
    case 'math':
      return { ...base, mathField: '', mathOp: '+', mathValue: '', mathOutputName: 'result' };
    case 'compare':
      return { ...base, compareField: '', compareOp: '==', compareValue: '', compareOutputName: 'result' };
    case 'rename-fields':
      return { ...base, renames: [{ oldName: '', newName: '' }] };
  }
}

// Styles
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

export function DataTransformField({ value, onChange, error }: DataTransformFieldProps) {
  // Parse existing value to determine initial mode
  const parsed = parseTransform(value || '');
  const initialMode: ActiveMode = parsed.meta?.mode === 'simple' ? 'simple' : (value ? 'code' : 'simple');
  const initialMeta = parsed.meta || getDefaultMeta('extract-single');

  const [activeMode, setActiveMode] = useState<ActiveMode>(initialMode);
  const [meta, setMeta] = useState<TransformMeta>(initialMeta);
  const [codeValue, setCodeValue] = useState(parsed.expression || '');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showConfirmSwitch, setShowConfirmSwitch] = useState(false);
  const [testInput, setTestInput] = useState('{ }');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const templateRef = useRef<HTMLDivElement>(null);

  // Close templates dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) {
        setShowTemplates(false);
      }
    }
    if (showTemplates) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showTemplates]);

  // Update parent when meta changes (simple mode)
  const updateMeta = (newMeta: TransformMeta) => {
    setMeta(newMeta);
    onChange(serializeTransform(newMeta));
  };

  // Update parent when code changes (code mode)
  const updateCode = (code: string) => {
    setCodeValue(code);
    onChange(code);
  };

  const switchToCode = () => {
    const expression = activeMode === 'simple' ? generateExpression(meta) : codeValue;
    setCodeValue(expression);
    setActiveMode('code');
    onChange(expression);
  };

  const switchToSimple = () => {
    // If there's custom code, warn user
    if (codeValue.trim() && activeMode === 'code') {
      setShowConfirmSwitch(true);
      return;
    }
    setActiveMode('simple');
    const newMeta = getDefaultMeta('extract-single');
    setMeta(newMeta);
    onChange(serializeTransform(newMeta));
  };

  const confirmSwitchToSimple = () => {
    setShowConfirmSwitch(false);
    setActiveMode('simple');
    const newMeta = getDefaultMeta('extract-single');
    setMeta(newMeta);
    onChange(serializeTransform(newMeta));
  };

  const applyTemplate = (template: TransformTemplate) => {
    if (template.meta) {
      setMeta(template.meta);
      setActiveMode('simple');
      onChange(serializeTransform(template.meta));
    } else {
      setCodeValue(template.expression);
      setActiveMode('code');
      onChange(template.expression);
    }
    if (template.sampleInput) {
      setTestInput(template.sampleInput);
    }
    setShowTemplates(false);
    setTestOutput(null);
    setTestError(null);
  };

  const handleOperationChange = (op: TransformOperation) => {
    const newMeta = getDefaultMeta(op);
    updateMeta(newMeta);
  };

  const runTest = () => {
    setTestOutput(null);
    setTestError(null);
    try {
      const inputData = JSON.parse(testInput);
      const expression = activeMode === 'simple' ? generateExpression(meta) : codeValue;
      const fn = new Function('data', expression);
      const result = fn(inputData);
      setTestOutput(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setTestError(err.message || 'Unknown error');
    }
  };

  const insertText = (text: string) => {
    setCodeValue((prev) => prev + text);
    onChange(codeValue + text);
  };

  // Get generated expression for preview
  const previewExpression = activeMode === 'simple' ? generateExpression(meta) : codeValue;

  // Group templates by category
  const templateCategories = TRANSFORM_TEMPLATES.reduce<Record<string, TransformTemplate[]>>((acc, t) => {
    (acc[t.category] = acc[t.category] || []).push(t);
    return acc;
  }, {});

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Label */}
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#fff' }}>
        Transform Expression
        <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
      </label>

      {/* Mode toggle + Templates */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '12px', position: 'relative' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #2a3f5f', flex: 1 }}>
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

        {/* Templates button */}
        <div ref={templateRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#2a3f5f',
              border: 'none',
              borderRadius: '4px',
              color: '#ccc',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <BookOpen size={14} />
            Templates
            <ChevronDown size={12} style={{ transform: showTemplates ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />
          </button>

          {/* Templates dropdown */}
          {showTemplates && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              width: '340px',
              maxHeight: '400px',
              overflowY: 'auto',
              background: '#1a1a2e',
              border: '1px solid #2a3f5f',
              borderRadius: '8px',
              zIndex: 50,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              {Object.entries(templateCategories).map(([category, templates]) => (
                <div key={category}>
                  <div style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#7c3aed',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #2a3f5f',
                    background: '#0d0d1a',
                    position: 'sticky',
                    top: 0,
                  }}>
                    {category}
                  </div>
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid #2a3f5f20',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#2a3f5f40')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>{t.name}</div>
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{t.description}</div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
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
          {/* Operation selector */}
          <select
            value={meta.operation}
            onChange={(e) => handleOperationChange(e.target.value as TransformOperation)}
            style={{
              ...selectStyle,
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              marginBottom: '12px',
            }}
          >
            {OPERATIONS.map((op) => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>

          {/* Operation description */}
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
            {OPERATIONS.find((o) => o.value === meta.operation)?.description}
          </div>

          {/* Dynamic form per operation */}
          <div style={{
            padding: '12px',
            background: '#0d0d1a',
            border: '1px solid #2a3f5f',
            borderRadius: '6px',
            marginBottom: '12px',
          }}>
            {meta.operation === 'extract-single' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Field Path</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#7c3aed', fontSize: '13px', fontFamily: 'monospace' }}>data.</span>
                    <input
                      type="text"
                      value={meta.fieldPath || ''}
                      onChange={(e) => updateMeta({ ...meta, fieldPath: e.target.value })}
                      placeholder="body.price"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Output Name</label>
                  <input
                    type="text"
                    value={meta.outputName || ''}
                    onChange={(e) => updateMeta({ ...meta, outputName: e.target.value })}
                    placeholder="price"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {meta.operation === 'extract-multiple' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(meta.extractions || []).map((ext, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                      <span style={{ color: '#7c3aed', fontSize: '12px', fontFamily: 'monospace', flexShrink: 0 }}>data.</span>
                      <input
                        type="text"
                        value={ext.fieldPath}
                        onChange={(e) => {
                          const exts = [...(meta.extractions || [])];
                          exts[i] = { ...exts[i], fieldPath: e.target.value };
                          updateMeta({ ...meta, extractions: exts });
                        }}
                        placeholder="field.path"
                        style={inputStyle}
                      />
                    </div>
                    <span style={{ color: '#888', fontSize: '12px' }}>as</span>
                    <input
                      type="text"
                      value={ext.outputName}
                      onChange={(e) => {
                        const exts = [...(meta.extractions || [])];
                        exts[i] = { ...exts[i], outputName: e.target.value };
                        updateMeta({ ...meta, extractions: exts });
                      }}
                      placeholder="outputName"
                      style={{ ...inputStyle, flex: 0.8 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const exts = (meta.extractions || []).filter((_, idx) => idx !== i);
                        updateMeta({ ...meta, extractions: exts.length > 0 ? exts : [{ fieldPath: '', outputName: '' }] });
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateMeta({ ...meta, extractions: [...(meta.extractions || []), { fieldPath: '', outputName: '' }] })}
                  style={{ ...smallBtnStyle, alignSelf: 'flex-start' }}
                >
                  <Plus size={12} /> Add Field
                </button>
              </div>
            )}

            {meta.operation === 'format-text' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                  Template (use {'{{field}}'} for data fields)
                </label>
                <textarea
                  value={meta.template || ''}
                  onChange={(e) => updateMeta({ ...meta, template: e.target.value })}
                  placeholder="Hello {{name}}, your balance is {{balance}}"
                  rows={3}
                  style={{
                    ...inputStyle,
                    width: '100%',
                    resize: 'vertical',
                  }}
                />
              </div>
            )}

            {meta.operation === 'math' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Field</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#7c3aed', fontSize: '13px', fontFamily: 'monospace' }}>data.</span>
                    <input
                      type="text"
                      value={meta.mathField || ''}
                      onChange={(e) => updateMeta({ ...meta, mathField: e.target.value })}
                      placeholder="value"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Operator</label>
                    <select
                      value={meta.mathOp || '+'}
                      onChange={(e) => updateMeta({ ...meta, mathOp: e.target.value as TransformMeta['mathOp'] })}
                      style={{ ...selectStyle, width: '100%' }}
                    >
                      {MATH_OPS.map((op) => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Value</label>
                    <input
                      type="text"
                      value={meta.mathValue || ''}
                      onChange={(e) => updateMeta({ ...meta, mathValue: e.target.value })}
                      placeholder="100"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Output Name</label>
                  <input
                    type="text"
                    value={meta.mathOutputName || ''}
                    onChange={(e) => updateMeta({ ...meta, mathOutputName: e.target.value })}
                    placeholder="result"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {meta.operation === 'compare' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Field</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#7c3aed', fontSize: '13px', fontFamily: 'monospace' }}>data.</span>
                    <input
                      type="text"
                      value={meta.compareField || ''}
                      onChange={(e) => updateMeta({ ...meta, compareField: e.target.value })}
                      placeholder="value"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Operator</label>
                    <select
                      value={meta.compareOp || '=='}
                      onChange={(e) => updateMeta({ ...meta, compareOp: e.target.value as TransformMeta['compareOp'] })}
                      style={{ ...selectStyle, width: '100%' }}
                    >
                      {COMPARE_OPS.map((op) => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Value</label>
                    <input
                      type="text"
                      value={meta.compareValue || ''}
                      onChange={(e) => updateMeta({ ...meta, compareValue: e.target.value })}
                      placeholder="1000"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Output Name</label>
                  <input
                    type="text"
                    value={meta.compareOutputName || ''}
                    onChange={(e) => updateMeta({ ...meta, compareOutputName: e.target.value })}
                    placeholder="result"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {meta.operation === 'rename-fields' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(meta.renames || []).map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                      <span style={{ color: '#7c3aed', fontSize: '12px', fontFamily: 'monospace', flexShrink: 0 }}>data.</span>
                      <input
                        type="text"
                        value={r.oldName}
                        onChange={(e) => {
                          const renames = [...(meta.renames || [])];
                          renames[i] = { ...renames[i], oldName: e.target.value };
                          updateMeta({ ...meta, renames });
                        }}
                        placeholder="oldFieldName"
                        style={inputStyle}
                      />
                    </div>
                    <span style={{ color: '#888', fontSize: '14px' }}>&rarr;</span>
                    <input
                      type="text"
                      value={r.newName}
                      onChange={(e) => {
                        const renames = [...(meta.renames || [])];
                        renames[i] = { ...renames[i], newName: e.target.value };
                        updateMeta({ ...meta, renames });
                      }}
                      placeholder="newFieldName"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const renames = (meta.renames || []).filter((_, idx) => idx !== i);
                        updateMeta({ ...meta, renames: renames.length > 0 ? renames : [{ oldName: '', newName: '' }] });
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateMeta({ ...meta, renames: [...(meta.renames || []), { oldName: '', newName: '' }] })}
                  style={{ ...smallBtnStyle, alignSelf: 'flex-start' }}
                >
                  <Plus size={12} /> Add Rename
                </button>
              </div>
            )}
          </div>

          {/* Live preview */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Generated Expression</label>
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
              {previewExpression || '// Configure the operation above'}
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
            placeholder={'// Access input via "data"\nconst result = JSON.parse(data.body);\nreturn { price: result.price };'}
            rows={12}
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
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: '#888', lineHeight: '26px' }}>Insert:</span>
            {QUICK_INSERTS.map((qi) => (
              <button
                key={qi.label}
                type="button"
                onClick={() => insertText(qi.text)}
                style={smallBtnStyle}
              >
                {qi.label}
              </button>
            ))}
          </div>

          {/* Test Expression panel */}
          <div style={{
            padding: '12px',
            background: '#0d0d1a',
            border: '1px solid #2a3f5f',
            borderRadius: '6px',
          }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>
              Test Expression
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder='{ "body": "{}" }'
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  flex: 1,
                }}
              />
              <button
                type="button"
                onClick={runTest}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#7c3aed',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  whiteSpace: 'nowrap',
                }}
              >
                <Play size={14} />
                Run
              </button>
            </div>
            {testOutput !== null && (
              <pre style={{
                padding: '8px 10px',
                background: '#10b98115',
                border: '1px solid #10b98140',
                borderRadius: '4px',
                color: '#34d399',
                fontSize: '12px',
                fontFamily: 'monospace',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                {testOutput}
              </pre>
            )}
            {testError !== null && (
              <pre style={{
                padding: '8px 10px',
                background: '#ef444415',
                border: '1px solid #ef444440',
                borderRadius: '4px',
                color: '#fca5a5',
                fontSize: '12px',
                fontFamily: 'monospace',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                Error: {testError}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Help text */}
      {!error && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
          {activeMode === 'simple'
            ? 'Use the visual builder above, or switch to Code mode for full JavaScript control.'
            : 'JavaScript expression. Access upstream data via the "data" variable. Must return a value.'}
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
