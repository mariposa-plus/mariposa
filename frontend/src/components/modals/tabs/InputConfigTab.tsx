'use client';

import { useState, useMemo } from 'react';
import { Plus, X, ArrowRight, Info } from 'lucide-react';
import { InputConfig, FieldMapping, PipelineNode } from '@/types';
import { getAllUpstreamOutputs, NodeOutput } from '@/utils/nodeOutputHelper';

interface InputConfigTabProps {
  inputConfig: InputConfig;
  upstreamNodes: PipelineNode[];
  onChange: (config: InputConfig) => void;
}

export function InputConfigTab({
  inputConfig,
  upstreamNodes,
  onChange,
}: InputConfigTabProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>(inputConfig.mappings || []);

  // Get all available outputs from upstream nodes
  const upstreamOutputsMap = useMemo(() => {
    const result = getAllUpstreamOutputs(upstreamNodes);
    console.log('🔍 [InputConfigTab] Result:', { mapSize: result.size, entries: Array.from(result.entries()).map(([id, outputs]) => ({ id, count: outputs.length })) });
    return result;
  }, [upstreamNodes]);

  const addMapping = () => {
    if (upstreamNodes.length === 0) return;

    const newMapping: FieldMapping = {
      sourceNodeId: upstreamNodes[0].id,
      sourceField: '',
      targetField: '',
      transform: 'none',
    };

    const updated = [...mappings, newMapping];
    setMappings(updated);
    onChange({ ...inputConfig, mappings: updated });
  };

  const removeMapping = (index: number) => {
    const updated = mappings.filter((_, i) => i !== index);
    setMappings(updated);
    onChange({ ...inputConfig, mappings: updated });
  };

  const updateMapping = (index: number, field: keyof FieldMapping, value: any) => {
    const updated = mappings.map((mapping, i) =>
      i === index ? { ...mapping, [field]: value } : mapping
    );
    setMappings(updated);
    onChange({ ...inputConfig, mappings: updated });
  };

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
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
          Input Field Mappings
        </h3>
        <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>
          Map output fields from upstream nodes to input fields of this component.
        </p>
      </div>

      {/* Upstream Nodes Summary */}
      <div
        style={{
          marginBottom: '24px',
          padding: '12px',
          background: '#16213e',
          borderRadius: '8px',
          border: '1px solid #2a3f5f',
        }}
      >
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: '600' }}>
          CONNECTED UPSTREAM NODES
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {upstreamNodes.map((node) => (
            <div
              key={node.id}
              style={{
                padding: '6px 12px',
                background: '#1a1a2e',
                border: '1px solid #2a3f5f',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#fff',
              }}
            >
              {node.data.label}
            </div>
          ))}
        </div>
      </div>

      {/* Mappings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {mappings.map((mapping, index) => {
          const sourceNode = upstreamNodes.find(n => n.id === mapping.sourceNodeId);
          const availableOutputs = sourceNode ? upstreamOutputsMap.get(sourceNode.id) || [] : [];
          const selectedOutput = availableOutputs.find(o => o.id === mapping.sourceField);

          console.log('🔍 [Render] Mapping dropdown:', {
            index,
            mappingSourceNodeId: mapping.sourceNodeId,
            foundSourceNode: !!sourceNode,
            sourceNodeId: sourceNode?.id,
            availableOutputsCount: availableOutputs.length,
            mapHasKey: upstreamOutputsMap.has(mapping.sourceNodeId),
            mapSize: upstreamOutputsMap.size,
            mapKeys: Array.from(upstreamOutputsMap.keys()),
          });

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                {/* Source Node */}
                <select
                  value={mapping.sourceNodeId}
                  onChange={(e) => {
                    updateMapping(index, 'sourceNodeId', e.target.value);
                    updateMapping(index, 'sourceField', ''); // Reset source field when changing node
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
                  onChange={(e) => updateMapping(index, 'targetField', e.target.value)}
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
                  onClick={() => removeMapping(index)}
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
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px' }}>
                    Source Output
                  </label>
                  {availableOutputs.length > 0 ? (
                    <select
                      value={mapping.sourceField}
                      onChange={(e) => updateMapping(index, 'sourceField', e.target.value)}
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
                        <option key={output.id} value={output.id} title={output.description}>
                          {output.label} ({output.type})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={mapping.sourceField}
                      onChange={(e) => updateMapping(index, 'sourceField', e.target.value)}
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
                    <div style={{ marginTop: '4px', fontSize: '10px', color: '#888', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                      <Info size={10} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{selectedOutput.description}</span>
                    </div>
                  )}
                </div>

                {/* Transform */}
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px' }}>
                    Transform
                  </label>
                  <select
                    value={mapping.transform || 'none'}
                    onChange={(e) => updateMapping(index, 'transform', e.target.value)}
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
                  <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px' }}>
                    Custom Transform (JavaScript)
                  </label>
                  <input
                    type="text"
                    value={mapping.customTransform || ''}
                    onChange={(e) => updateMapping(index, 'customTransform', e.target.value)}
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
        onClick={addMapping}
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
  );
}
