'use client';

import { useState, useRef, useCallback } from 'react';
import { Plus, X, Upload, CheckCircle, Code, FileJson } from 'lucide-react';

// ── Types (file-local) ──────────────────────────────────────────────

interface AbiFunction {
  name: string;
  type: 'function';
  stateMutability: 'nonpayable' | 'payable';
  inputs: Array<{ name: string; type: string }>;
}

interface FunctionParam {
  name: string;
  type: string;
  value: string;
}

interface EvmFunctionCallValue {
  mode: 'abi' | 'manual';
  abi?: any[];
  functionName: string;
  params: FunctionParam[];
  types: string[];
  values: string[];
}

interface EvmFunctionCallFieldProps {
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

// ── Constants ────────────────────────────────────────────────────────

const SOLIDITY_TYPES = [
  'uint256', 'uint128', 'uint64', 'int256',
  'address', 'bytes', 'bytes32', 'bytes4',
  'string', 'bool', 'uint256[]', 'address[]', 'bytes[]',
];

// ── Helpers ──────────────────────────────────────────────────────────

function parseAbi(raw: string): { functions: AbiFunction[]; fullAbi: any[]; error: string | null } {
  try {
    const parsed = JSON.parse(raw);
    let abiArray: any[];

    if (Array.isArray(parsed)) {
      abiArray = parsed;
    } else if (parsed && Array.isArray(parsed.abi)) {
      // Hardhat / Foundry artifact format
      abiArray = parsed.abi;
    } else {
      return { functions: [], fullAbi: [], error: 'Expected a JSON array or an object with an "abi" array' };
    }

    const functions = abiArray.filter(
      (item: any) =>
        item.type === 'function' &&
        item.stateMutability !== 'view' &&
        item.stateMutability !== 'pure'
    ) as AbiFunction[];

    return { functions, fullAbi: abiArray, error: null };
  } catch (e: any) {
    return { functions: [], fullAbi: [], error: `Invalid JSON: ${e.message}` };
  }
}

function buildSerialized(functionName: string, params: FunctionParam[], mode: 'abi' | 'manual', abi?: any[]): EvmFunctionCallValue {
  return {
    mode,
    ...(abi ? { abi } : {}),
    functionName,
    params,
    types: params.map((p) => p.type),
    values: params.map((p) => p.value),
  };
}

/** Reconstruct params from legacy { types, values } format */
function legacyToParams(obj: any): FunctionParam[] {
  const types: string[] = Array.isArray(obj.types) ? obj.types : [];
  const values: any[] = Array.isArray(obj.values) ? obj.values : [];
  return types.map((type, i) => ({
    name: `param${i}`,
    type,
    value: String(values[i] ?? ''),
  }));
}

function deserialize(raw: any): {
  mode: 'abi' | 'manual';
  abi?: any[];
  functionName: string;
  params: FunctionParam[];
  abiFunctions: AbiFunction[];
} {
  if (!raw || (typeof raw === 'string' && raw.trim() === '')) {
    return { mode: 'manual', functionName: '', params: [{ name: '', type: 'uint256', value: '' }], abiFunctions: [] };
  }

  const obj = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : raw;
  if (!obj || typeof obj !== 'object') {
    return { mode: 'manual', functionName: '', params: [{ name: '', type: 'uint256', value: '' }], abiFunctions: [] };
  }

  if (obj.mode === 'abi' && obj.abi) {
    const { functions } = parseAbi(JSON.stringify(obj.abi));
    return {
      mode: 'abi',
      abi: obj.abi,
      functionName: obj.functionName || '',
      params: Array.isArray(obj.params) ? obj.params : [],
      abiFunctions: functions,
    };
  }

  // Legacy or manual
  const params = Array.isArray(obj.params) ? obj.params : legacyToParams(obj);
  return {
    mode: 'manual',
    functionName: obj.functionName || '',
    params: params.length > 0 ? params : [{ name: '', type: 'uint256', value: '' }],
    abiFunctions: [],
  };
}

// ── Styles ───────────────────────────────────────────────────────────

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

// ── Component ────────────────────────────────────────────────────────

export function EvmFunctionCallField({ value, onChange, error }: EvmFunctionCallFieldProps) {
  const initial = deserialize(value);

  const [mode, setMode] = useState<'abi' | 'manual'>(initial.mode);
  const [abiText, setAbiText] = useState(initial.abi ? JSON.stringify(initial.abi, null, 2) : '');
  const [abiFunctions, setAbiFunctions] = useState<AbiFunction[]>(initial.abiFunctions);
  const [fullAbi, setFullAbi] = useState<any[] | undefined>(initial.abi);
  const [abiError, setAbiError] = useState<string | null>(null);
  const [abiSuccess, setAbiSuccess] = useState<string | null>(
    initial.abiFunctions.length > 0 ? `ABI loaded: ${initial.abiFunctions.length} write function(s) found` : null
  );
  const [functionName, setFunctionName] = useState(initial.functionName);
  const [params, setParams] = useState<FunctionParam[]>(initial.params);
  const [showConfirmSwitch, setShowConfirmSwitch] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Emit ─────────────────────────────────────────

  const emit = useCallback((fn: string, ps: FunctionParam[], m: 'abi' | 'manual', a?: any[]) => {
    onChange(buildSerialized(fn, ps, m, a));
  }, [onChange]);

  // ── ABI handling ─────────────────────────────────

  const handleAbiParse = (text: string) => {
    setAbiText(text);
    setAbiError(null);
    setAbiSuccess(null);

    if (!text.trim()) {
      setAbiFunctions([]);
      setFullAbi(undefined);
      return;
    }

    const result = parseAbi(text);
    if (result.error) {
      setAbiError(result.error);
      setAbiFunctions([]);
      setFullAbi(undefined);
      return;
    }

    setAbiFunctions(result.functions);
    setFullAbi(result.fullAbi);
    setAbiSuccess(`ABI loaded: ${result.functions.length} write function(s) found`);

    // Auto-select first function if only one
    if (result.functions.length === 1) {
      const fn = result.functions[0];
      const newParams = fn.inputs.map((inp) => ({ name: inp.name, type: inp.type, value: '' }));
      setFunctionName(fn.name);
      setParams(newParams);
      emit(fn.name, newParams, 'abi', result.fullAbi);
    } else {
      setFunctionName('');
      setParams([]);
      emit('', [], 'abi', result.fullAbi);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      handleAbiParse(text);
    };
    reader.readAsText(file);
    // Reset so same file can be re-uploaded
    e.target.value = '';
  };

  const handleFunctionSelect = (name: string) => {
    setFunctionName(name);
    const fn = abiFunctions.find((f) => f.name === name);
    if (fn) {
      const newParams = fn.inputs.map((inp) => ({ name: inp.name, type: inp.type, value: '' }));
      setParams(newParams);
      emit(name, newParams, 'abi', fullAbi);
    } else {
      setParams([]);
      emit(name, [], 'abi', fullAbi);
    }
  };

  // ── Manual mode ──────────────────────────────────

  const updateFunctionName = (name: string) => {
    setFunctionName(name);
    emit(name, params, mode, fullAbi);
  };

  const updateParam = (index: number, field: keyof FunctionParam, val: string) => {
    const updated = [...params];
    updated[index] = { ...updated[index], [field]: val };
    setParams(updated);
    emit(functionName, updated, mode, mode === 'abi' ? fullAbi : undefined);
  };

  const addParam = () => {
    const updated = [...params, { name: '', type: 'uint256', value: '' }];
    setParams(updated);
    emit(functionName, updated, mode, mode === 'abi' ? fullAbi : undefined);
  };

  const removeParam = (index: number) => {
    const updated = params.filter((_, i) => i !== index);
    const result = updated.length > 0 ? updated : [{ name: '', type: 'uint256', value: '' }];
    setParams(result);
    emit(functionName, result, mode, mode === 'abi' ? fullAbi : undefined);
  };

  // ── Mode switching ───────────────────────────────

  const switchToAbi = () => {
    setMode('abi');
    // Keep params if any
    emit(functionName, params, 'abi', fullAbi);
  };

  const switchToManual = () => {
    if (abiText.trim() && mode === 'abi') {
      setShowConfirmSwitch(true);
      return;
    }
    doSwitchToManual();
  };

  const doSwitchToManual = () => {
    setShowConfirmSwitch(false);
    setMode('manual');
    setAbiText('');
    setAbiFunctions([]);
    setFullAbi(undefined);
    setAbiError(null);
    setAbiSuccess(null);
    const manualParams = params.length > 0 ? params : [{ name: '', type: 'uint256', value: '' }];
    setParams(manualParams);
    emit(functionName, manualParams, 'manual');
  };

  // ── Preview ──────────────────────────────────────

  const signature = functionName
    ? `${functionName}(${params.map((p) => p.type).join(', ')})`
    : '';
  const valuesPreview = params
    .filter((p) => p.name || p.value)
    .map((p) => `${p.name || '?'} = ${p.value || '""'}`)
    .join(', ');

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Label */}
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#fff' }}>
        Function Call
        <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
      </label>

      {/* Mode toggle */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2a3f5f', marginBottom: '12px' }}>
        <button
          type="button"
          onClick={() => mode === 'manual' ? switchToAbi() : null}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: mode === 'abi' ? '2px solid #2563eb' : '2px solid transparent',
            color: mode === 'abi' ? '#fff' : '#888',
            fontSize: '13px',
            fontWeight: mode === 'abi' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FileJson size={14} />
          ABI
        </button>
        <button
          type="button"
          onClick={() => mode === 'abi' ? switchToManual() : null}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: mode === 'manual' ? '2px solid #2563eb' : '2px solid transparent',
            color: mode === 'manual' ? '#fff' : '#888',
            fontSize: '13px',
            fontWeight: mode === 'manual' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Code size={14} />
          Manual
        </button>
      </div>

      {/* Confirmation dialog for switching to Manual */}
      {showConfirmSwitch && (
        <div style={{
          padding: '12px',
          marginBottom: '12px',
          background: '#ef444415',
          border: '1px solid #ef444460',
          borderRadius: '6px',
        }}>
          <div style={{ fontSize: '13px', color: '#fca5a5', marginBottom: '8px' }}>
            Switching to Manual mode will discard the loaded ABI. Continue?
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={doSwitchToManual} style={{ ...smallBtnStyle, background: '#ef4444', color: '#fff' }}>
              Switch to Manual
            </button>
            <button type="button" onClick={() => setShowConfirmSwitch(false)} style={smallBtnStyle}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ====== ABI MODE ====== */}
      {mode === 'abi' && (
        <div>
          {/* ABI input area */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', color: '#888' }}>Paste ABI JSON</label>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    ...smallBtnStyle,
                    gap: '6px',
                  }}
                >
                  <Upload size={12} />
                  Upload JSON
                </button>
              </div>
            </div>
            <textarea
              value={abiText}
              onChange={(e) => handleAbiParse(e.target.value)}
              placeholder='[{"type":"function","name":"updatePrice","stateMutability":"nonpayable","inputs":[{"name":"_price","type":"uint256"}]}]'
              rows={5}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#1a1a2e',
                border: `1px solid ${abiError ? '#ef4444' : '#2a3f5f'}`,
                borderRadius: '6px',
                color: '#34d399',
                fontSize: '12px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: '"Fira Code", "Courier New", monospace',
              }}
            />
          </div>

          {/* ABI status */}
          {abiError && (
            <div style={{
              padding: '8px 10px',
              marginBottom: '12px',
              background: '#ef444415',
              border: '1px solid #ef444440',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#fca5a5',
            }}>
              {abiError}
            </div>
          )}
          {abiSuccess && (
            <div style={{
              padding: '8px 10px',
              marginBottom: '12px',
              background: '#10b98115',
              border: '1px solid #10b98140',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <CheckCircle size={14} />
              {abiSuccess}
            </div>
          )}

          {/* Function selector */}
          {abiFunctions.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Function</label>
              <select
                value={functionName}
                onChange={(e) => handleFunctionSelect(e.target.value)}
                style={{ ...selectStyle, width: '100%', padding: '10px 12px', fontSize: '14px' }}
              >
                <option value="">Select a function...</option>
                {abiFunctions.map((fn) => (
                  <option key={fn.name} value={fn.name}>
                    {fn.name}({fn.inputs.map((i) => `${i.type} ${i.name}`).join(', ')})
                    {fn.stateMutability === 'payable' ? ' [payable]' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ABI parameter values */}
          {functionName && params.length > 0 && (
            <div style={{
              padding: '12px',
              background: '#0d0d1a',
              border: '1px solid #2a3f5f',
              borderRadius: '6px',
              marginBottom: '12px',
            }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>Parameters</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {params.map((param, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      background: '#2563eb20',
                      border: '1px solid #2563eb40',
                      borderRadius: '4px',
                      color: '#60a5fa',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {param.type}
                    </span>
                    <span style={{ color: '#888', fontSize: '13px', fontFamily: 'monospace', flexShrink: 0 }}>
                      {param.name}
                    </span>
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => updateParam(i, 'value', e.target.value)}
                      placeholder={`Enter ${param.type} value or {{data.field}}`}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====== MANUAL MODE ====== */}
      {mode === 'manual' && (
        <div>
          {/* Function name */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Function Name</label>
            <input
              type="text"
              value={functionName}
              onChange={(e) => updateFunctionName(e.target.value)}
              placeholder="e.g. updatePrice"
              style={{ ...inputStyle, width: '100%', padding: '10px 12px', fontSize: '14px' }}
            />
          </div>

          {/* Parameter rows */}
          <div style={{
            padding: '12px',
            background: '#0d0d1a',
            border: '1px solid #2a3f5f',
            borderRadius: '6px',
            marginBottom: '12px',
          }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>Parameters</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {params.map((param, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <select
                    value={param.type}
                    onChange={(e) => updateParam(i, 'type', e.target.value)}
                    style={{ ...selectStyle, flex: '0 0 120px' }}
                  >
                    {SOLIDITY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => updateParam(i, 'name', e.target.value)}
                    placeholder="name"
                    style={{ ...inputStyle, flex: '0 0 100px' }}
                  />
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => updateParam(i, 'value', e.target.value)}
                    placeholder="value or {{data.field}}"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => removeParam(i)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#888',
                      cursor: 'pointer',
                      padding: '4px',
                      flexShrink: 0,
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addParam}
              style={{ ...smallBtnStyle, marginTop: '8px' }}
            >
              <Plus size={12} /> Add Parameter
            </button>
          </div>
        </div>
      )}

      {/* ====== CALL PREVIEW ====== */}
      {(functionName || params.some((p) => p.type && p.value)) && (
        <div style={{
          padding: '10px 12px',
          background: '#1a1a2e',
          border: '1px solid #2a3f5f',
          borderRadius: '6px',
          marginBottom: '8px',
        }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Call Preview
          </label>
          {signature && (
            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#60a5fa', marginBottom: '4px' }}>
              <span style={{ color: '#888' }}>Signature: </span>{signature}
            </div>
          )}
          {valuesPreview && (
            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#34d399', marginBottom: '4px' }}>
              <span style={{ color: '#888' }}>Values:    </span>{valuesPreview}
            </div>
          )}
          <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#a78bfa' }}>
            <span style={{ color: '#888' }}>Encoded:   </span>
            {`{"types":[${params.map((p) => `"${p.type}"`).join(',')}],"values":[${params.map((p) => `"${p.value}"`).join(',')}]}`}
          </div>
        </div>
      )}

      {/* Help text */}
      {!error && (
        <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
          {mode === 'abi'
            ? 'Paste or upload a contract ABI to auto-populate function parameters.'
            : 'Define the contract function and parameters to encode.'}
        </div>
      )}

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
