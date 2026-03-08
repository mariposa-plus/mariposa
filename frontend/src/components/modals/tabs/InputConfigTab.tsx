'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, X, ArrowRight, Info, CheckCircle, ChevronRight, ChevronDown, Layers } from 'lucide-react';
import { InputConfig, FieldMapping, PipelineNode } from '@/types';
import { getAllUpstreamOutputs, getNodeOutputs, NodeOutput } from '@/utils/nodeOutputHelper';

interface InputConfigTabProps {
  inputConfig: InputConfig;
  upstreamNodes: PipelineNode[];
  onChange: (config: InputConfig) => void;
}

// Check if a mapping is a wildcard auto-mapping
function isWildcardMapping(m: FieldMapping): boolean {
  return m.sourceField === '*';
}

// Generate preview JSON from schema outputs
function generatePreview(outputs: NodeOutput[]): Record<string, string> {
  const preview: Record<string, string> = {};
  for (const out of outputs) {
    preview[out.id] = `(${out.type})`;
  }
  return preview;
}

// Sanitize node label for use as a field name
function sanitizeLabel(label: string): string {
  return label
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .toLowerCase();
}

export function InputConfigTab({
  inputConfig,
  upstreamNodes,
  onChange,
}: InputConfigTabProps) {
  // Selected upstream node ID (auto-selected if only one)
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  // Whether "merge all" is active (multi-upstream)
  const [mergeAll, setMergeAll] = useState(false);
  // Whether the Advanced section is expanded
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Manual mappings (for the Advanced section)
  const [manualMappings, setManualMappings] = useState<FieldMapping[]>([]);

  // Get all available outputs from upstream nodes
  const upstreamOutputsMap = useMemo(() => {
    return getAllUpstreamOutputs(upstreamNodes);
  }, [upstreamNodes]);

  // Build and emit combined mappings
  const emitMappings = useCallback(
    (sourceId: string | null, isMergeAll: boolean, manual: FieldMapping[]) => {
      const wildcardMappings: FieldMapping[] = [];

      if (isMergeAll) {
        // One wildcard mapping per upstream node
        for (const node of upstreamNodes) {
          wildcardMappings.push({
            sourceNodeId: node.id,
            sourceField: '*',
            targetField: sanitizeLabel(node.data.label),
            transform: 'none',
          });
        }
      } else if (sourceId) {
        wildcardMappings.push({
          sourceNodeId: sourceId,
          sourceField: '*',
          targetField: 'data',
          transform: 'none',
        });
      }

      const combined = [...wildcardMappings, ...manual];
      onChange({ ...inputConfig, mappings: combined });
    },
    [upstreamNodes, inputConfig, onChange]
  );

  // Initialization: parse existing mappings on mount
  useEffect(() => {
    const mappings = inputConfig.mappings || [];
    const wildcards = mappings.filter(isWildcardMapping);
    const manuals = mappings.filter((m) => !isWildcardMapping(m));

    if (wildcards.length > 1) {
      // Multiple wildcards = merge mode
      setMergeAll(true);
      setSelectedSourceId(null);
    } else if (wildcards.length === 1) {
      setSelectedSourceId(wildcards[0].sourceNodeId);
      setMergeAll(false);
    } else if (manuals.length > 0) {
      // Only manual mappings — select the first one's source, expand Advanced
      setSelectedSourceId(manuals[0].sourceNodeId);
      setShowAdvanced(true);
      setMergeAll(false);
    } else if (upstreamNodes.length === 1) {
      // No mappings, single upstream — auto-select and auto-create
      setSelectedSourceId(upstreamNodes[0].id);
      setMergeAll(false);
    } else {
      // No mappings, multiple upstream — user picks
      setSelectedSourceId(null);
      setMergeAll(false);
    }

    setManualMappings(manuals);
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-create wildcard mapping when auto-selecting single upstream on mount
  useEffect(() => {
    const mappings = inputConfig.mappings || [];
    if (
      mappings.length === 0 &&
      upstreamNodes.length === 1 &&
      selectedSourceId === upstreamNodes[0].id
    ) {
      emitMappings(upstreamNodes[0].id, false, []);
    }
    // Only run after initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSourceId]);

  // Handle source selection
  const handleSelectSource = (nodeId: string) => {
    setSelectedSourceId(nodeId);
    setMergeAll(false);
    emitMappings(nodeId, false, manualMappings);
  };

  // Handle merge all toggle
  const handleMergeToggle = (checked: boolean) => {
    setMergeAll(checked);
    if (checked) {
      setSelectedSourceId(null);
      emitMappings(null, true, manualMappings);
    } else {
      // Revert to first upstream if available
      const firstId = upstreamNodes.length > 0 ? upstreamNodes[0].id : null;
      setSelectedSourceId(firstId);
      emitMappings(firstId, false, manualMappings);
    }
  };

  // Manual mapping CRUD
  const addManualMapping = () => {
    if (upstreamNodes.length === 0) return;
    const newMapping: FieldMapping = {
      sourceNodeId: selectedSourceId || upstreamNodes[0].id,
      sourceField: '',
      targetField: '',
      transform: 'none',
    };
    const updated = [...manualMappings, newMapping];
    setManualMappings(updated);
    emitMappings(selectedSourceId, mergeAll, updated);
  };

  const removeManualMapping = (index: number) => {
    const updated = manualMappings.filter((_, i) => i !== index);
    setManualMappings(updated);
    emitMappings(selectedSourceId, mergeAll, updated);
  };

  const updateManualMapping = (index: number, field: keyof FieldMapping, value: string) => {
    const updated = manualMappings.map((mapping, i) =>
      i === index ? { ...mapping, [field]: value } : mapping
    );
    setManualMappings(updated);
    emitMappings(selectedSourceId, mergeAll, updated);
  };

  // Get the selected node and its outputs for preview
  const selectedNode = upstreamNodes.find((n) => n.id === selectedSourceId) || null;
  const selectedOutputs = selectedNode ? getNodeOutputs(selectedNode) : [];
  const previewData = selectedOutputs.length > 0 ? generatePreview(selectedOutputs) : null;

  // Empty state: no upstream nodes
  if (upstreamNodes.length === 0) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          background: '#16213e',
          borderRadius: '8px',
          border: '2px dashed #2a3f5f',
        }}
      >
        <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>
          No upstream nodes connected.
          <br />
          Connect nodes to this component to configure input mapping.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* SECTION 1: Data Source */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
          Data Source
        </h3>
        <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 12px 0' }}>
          Select which node&apos;s output to use as input.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {upstreamNodes.map((node) => {
            const isSelected = !mergeAll && selectedSourceId === node.id;
            const nodeOutputs = upstreamOutputsMap.get(node.id) || [];
            const outputSummary =
              nodeOutputs.length > 0
                ? nodeOutputs.map((o) => o.label).join(', ')
                : 'No defined outputs';

            return (
              <div
                key={node.id}
                onClick={() => handleSelectSource(node.id)}
                style={{
                  padding: '12px 16px',
                  background: isSelected ? 'rgba(16, 185, 129, 0.05)' : '#16213e',
                  border: isSelected
                    ? '2px solid #10b981'
                    : '1px solid #2a3f5f',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Radio / Check indicator */}
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isSelected
                      ? '2px solid #10b981'
                      : '2px solid #4a5568',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: isSelected ? '#10b981' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isSelected && <CheckCircle size={14} color="#fff" />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                    {node.data.label}
                  </div>
                  <div
                    style={{
                      color: '#888',
                      fontSize: '12px',
                      marginTop: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Outputs: {outputSummary}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Merge all checkbox — only for multiple upstream */}
        {upstreamNodes.length > 1 && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '12px',
              padding: '10px 12px',
              background: mergeAll ? 'rgba(99, 102, 241, 0.05)' : '#16213e',
              border: mergeAll ? '1px solid #6366f1' : '1px solid #2a3f5f',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <input
              type="checkbox"
              checked={mergeAll}
              onChange={(e) => handleMergeToggle(e.target.checked)}
              style={{ accentColor: '#6366f1' }}
            />
            <Layers size={16} color={mergeAll ? '#6366f1' : '#888'} />
            <div>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>
                Merge all inputs
              </div>
              <div style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>
                Combine outputs from all upstream nodes into separate fields.
              </div>
            </div>
          </label>
        )}
      </div>

      {/* SECTION 2: Status Banner */}
      {(selectedSourceId || mergeAll) && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <div style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>
              Input configured
            </div>
            <div style={{ color: '#a7c4b5', fontSize: '13px', marginTop: '2px' }}>
              {mergeAll ? (
                <>
                  All outputs from {upstreamNodes.length} upstream nodes will be available.
                  Access each via its field name (e.g.,{' '}
                  <code style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '1px 4px', borderRadius: '3px', fontSize: '12px' }}>
                    {sanitizeLabel(upstreamNodes[0]?.data.label || 'node')}.fieldName
                  </code>
                  ).
                </>
              ) : (
                <>
                  All output from <strong>{selectedNode?.data.label}</strong> will be available as{' '}
                  <code style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '1px 4px', borderRadius: '3px', fontSize: '12px' }}>
                    data
                  </code>{' '}
                  in your transform.
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Preview Input Data */}
      {selectedSourceId && !mergeAll && previewData && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', color: '#888', fontWeight: '600', marginBottom: '8px' }}>
            PREVIEW INPUT DATA
          </div>
          <pre
            style={{
              padding: '14px',
              background: '#0f1419',
              border: '1px solid #2a3f5f',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '13px',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              margin: 0,
              overflowX: 'auto',
              lineHeight: '1.6',
            }}
          >
            {JSON.stringify(previewData, null, 2)}
          </pre>
          {selectedOutputs.length > 0 && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
              }}
            >
              <Info size={14} color="#6366f1" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ color: '#a0aec0', fontSize: '12px' }}>
                Access in transform:{' '}
                <span style={{ color: '#c4b5fd' }}>
                  {selectedOutputs.map((o) => `data.${o.id}`).join(', ')}
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Merge preview */}
      {mergeAll && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', color: '#888', fontWeight: '600', marginBottom: '8px' }}>
            MERGED INPUT DATA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upstreamNodes.map((node) => {
              const nodeOutputs = upstreamOutputsMap.get(node.id) || [];
              const nodePreview = generatePreview(nodeOutputs);
              const fieldName = sanitizeLabel(node.data.label);

              return (
                <div key={node.id}>
                  <div style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '4px', fontWeight: '500' }}>
                    {node.data.label}{' '}
                    <span style={{ color: '#6366f1' }}>
                      ({fieldName}.*)
                    </span>
                  </div>
                  <pre
                    style={{
                      padding: '10px 14px',
                      background: '#0f1419',
                      border: '1px solid #2a3f5f',
                      borderRadius: '6px',
                      color: '#e2e8f0',
                      fontSize: '12px',
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      margin: 0,
                      overflowX: 'auto',
                      lineHeight: '1.5',
                    }}
                  >
                    {Object.keys(nodePreview).length > 0
                      ? JSON.stringify(nodePreview, null, 2)
                      : '{ /* no defined outputs */ }'}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: Advanced Custom Field Mapping */}
      <div
        style={{
          borderTop: '1px solid #2a3f5f',
          paddingTop: '16px',
        }}
      >
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'transparent',
            border: '1px solid #2a3f5f',
            borderRadius: '8px',
            color: '#aaa',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          {showAdvanced ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          Advanced: Custom Field Mapping
          {manualMappings.length > 0 && (
            <span
              style={{
                marginLeft: 'auto',
                background: '#2a3f5f',
                color: '#a0aec0',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
              }}
            >
              {manualMappings.length} mapping{manualMappings.length !== 1 ? 's' : ''}
            </span>
          )}
          {manualMappings.length === 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#666' }}>
              (optional)
            </span>
          )}
        </button>

        {showAdvanced && (
          <div style={{ marginTop: '12px' }}>
            {/* Manual Mappings List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {manualMappings.map((mapping, index) => {
                const sourceNode = upstreamNodes.find((n) => n.id === mapping.sourceNodeId);
                const availableOutputs = sourceNode
                  ? upstreamOutputsMap.get(sourceNode.id) || []
                  : [];
                const selectedOutput = availableOutputs.find(
                  (o) => o.id === mapping.sourceField
                );

                return (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      background: '#16213e',
                      borderRadius: '8px',
                      border: '1px solid #2a3f5f',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px',
                      }}
                    >
                      {/* Source Node */}
                      <select
                        value={mapping.sourceNodeId}
                        onChange={(e) => {
                          updateManualMapping(index, 'sourceNodeId', e.target.value);
                          updateManualMapping(index, 'sourceField', '');
                        }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: '#0f1419',
                          border: '1px solid #2a3f5f',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '13px',
                        }}
                      >
                        {upstreamNodes.map((node) => (
                          <option key={node.id} value={node.id}>
                            {node.data.label}
                          </option>
                        ))}
                      </select>

                      <ArrowRight size={16} color="#888" />

                      {/* Target Field */}
                      <input
                        type="text"
                        value={mapping.targetField}
                        onChange={(e) =>
                          updateManualMapping(index, 'targetField', e.target.value)
                        }
                        placeholder="Target field name"
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: '#0f1419',
                          border: '1px solid #2a3f5f',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '13px',
                        }}
                      />

                      {/* Remove Button */}
                      <button
                        onClick={() => removeManualMapping(index)}
                        style={{
                          padding: '8px',
                          background: 'rgba(220, 53, 69, 0.1)',
                          border: '1px solid rgba(220, 53, 69, 0.3)',
                          borderRadius: '6px',
                          color: '#dc3545',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {/* Source Output Field */}
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            fontSize: '11px',
                            color: '#888',
                            display: 'block',
                            marginBottom: '6px',
                          }}
                        >
                          Source Output
                        </label>
                        {availableOutputs.length > 0 ? (
                          <select
                            value={mapping.sourceField}
                            onChange={(e) =>
                              updateManualMapping(index, 'sourceField', e.target.value)
                            }
                            style={{
                              width: '100%',
                              padding: '8px',
                              background: '#0f1419',
                              border: '1px solid #2a3f5f',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '12px',
                            }}
                          >
                            <option value="">Select output field...</option>
                            {availableOutputs.map((output) => (
                              <option
                                key={output.id}
                                value={output.id}
                                title={output.description}
                              >
                                {output.label} ({output.type})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={mapping.sourceField}
                            onChange={(e) =>
                              updateManualMapping(index, 'sourceField', e.target.value)
                            }
                            placeholder="e.g., output.tokenId"
                            style={{
                              width: '100%',
                              padding: '8px',
                              background: '#0f1419',
                              border: '1px solid #2a3f5f',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '12px',
                            }}
                          />
                        )}
                        {selectedOutput && selectedOutput.description && (
                          <div
                            style={{
                              marginTop: '4px',
                              fontSize: '10px',
                              color: '#888',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '4px',
                            }}
                          >
                            <Info
                              size={10}
                              style={{ marginTop: '2px', flexShrink: 0 }}
                            />
                            <span>{selectedOutput.description}</span>
                          </div>
                        )}
                      </div>

                      {/* Transform */}
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            fontSize: '11px',
                            color: '#888',
                            display: 'block',
                            marginBottom: '6px',
                          }}
                        >
                          Transform
                        </label>
                        <select
                          value={mapping.transform || 'none'}
                          onChange={(e) =>
                            updateManualMapping(index, 'transform', e.target.value)
                          }
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: '#0f1419',
                            border: '1px solid #2a3f5f',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        >
                          <option value="none">None</option>
                          <option value="stringify">To String</option>
                          <option value="parse">Parse JSON</option>
                          <option value="uppercase">Uppercase</option>
                          <option value="lowercase">Lowercase</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>

                    {/* Custom Transform */}
                    {mapping.transform === 'custom' && (
                      <div style={{ marginTop: '12px' }}>
                        <label
                          style={{
                            fontSize: '11px',
                            color: '#888',
                            display: 'block',
                            marginBottom: '6px',
                          }}
                        >
                          Custom Transform (JavaScript)
                        </label>
                        <input
                          type="text"
                          value={mapping.customTransform || ''}
                          onChange={(e) =>
                            updateManualMapping(index, 'customTransform', e.target.value)
                          }
                          placeholder="e.g., value.toUpperCase()"
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: '#0f1419',
                            border: '1px solid #2a3f5f',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Mapping Button */}
            <button
              onClick={addManualMapping}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: '2px dashed #2a3f5f',
                borderRadius: '8px',
                color: '#888',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0070f3';
                e.currentTarget.style.color = '#0070f3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2a3f5f';
                e.currentTarget.style.color = '#888';
              }}
            >
              <Plus size={16} />
              Add Field Mapping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
