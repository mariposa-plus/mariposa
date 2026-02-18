'use client';

import { useState } from 'react';
import { Plus, X, CheckCircle, AlertCircle, Flag } from 'lucide-react';
import {
  OutputConfig,
  PipelineNode,
  OutputRoute,
} from '@/types';

type OutputEventType = 'success' | 'error' | 'complete' | 'custom';

interface OutputEvent {
  type: OutputEventType;
  targetNodeIds: string[];
  condition?: string;
  dataMapping?: Record<string, any>;
}

interface OutputConfigTabProps {
  outputConfig: OutputConfig;
  downstreamNodes: PipelineNode[];
  onChange: (config: OutputConfig) => void;
}

export function OutputConfigTab({
  outputConfig,
  downstreamNodes,
  onChange,
}: OutputConfigTabProps) {
  const [events, setEvents] = useState<OutputEvent[]>((outputConfig as any).events || []);

  const addEvent = (type: OutputEventType) => {
    const newEvent: OutputEvent = {
      type,
      targetNodeIds: downstreamNodes.length > 0 ? [downstreamNodes[0].id] : [],
      dataMapping: {},
    };

    const updated = [...events, newEvent];
    setEvents(updated);
    onChange({ ...outputConfig, events: updated } as any);
  };

  const removeEvent = (index: number) => {
    const updated = events.filter((_: any, i: number) => i !== index);
    setEvents(updated);
    onChange({ ...outputConfig, events: updated } as any);
  };

  const updateEvent = (index: number, field: keyof OutputEvent, value: any) => {
    const updated = events.map((event: any, i: number) =>
      i === index ? { ...event, [field]: value } : event
    );
    setEvents(updated);
    onChange({ ...outputConfig, events: updated } as any);
  };

  const toggleTargetNode = (eventIndex: number, nodeId: string) => {
    const event = events[eventIndex];
    const currentTargets = event.targetNodeIds || [];
    const updated = currentTargets.includes(nodeId)
      ? currentTargets.filter((id: string) => id !== nodeId)
      : [...currentTargets, nodeId];

    updateEvent(eventIndex, 'targetNodeIds', updated);
  };

  const getEventIcon = (type: OutputEventType) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} color="#10b981" />;
      case 'error': return <AlertCircle size={16} color="#ef4444" />;
      case 'complete': return <Flag size={16} color="#3b82f6" />;
      default: return <Flag size={16} color="#888" />;
    }
  };

  const getEventColor = (type: OutputEventType) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'complete': return '#3b82f6';
      default: return '#888';
    }
  };

  if (downstreamNodes.length === 0) {
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
          No downstream nodes connected.
          <br />
          Connect nodes from this component to configure output events.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
          Output Events
        </h3>
        <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>
          Define what happens when this component completes execution.
        </p>
      </div>

      {/* Downstream Nodes Summary */}
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
          CONNECTED DOWNSTREAM NODES
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {downstreamNodes.map((node) => (
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

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {events.map((event: OutputEvent, index: number) => {
          const color = getEventColor(event.type);

          return (
            <div
              key={index}
              style={{
                padding: '16px',
                background: '#16213e',
                borderRadius: '8px',
                border: `1px solid ${color}40`,
                borderLeft: `4px solid ${color}`,
              }}
            >
              {/* Event Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getEventIcon(event.type)}
                  <select
                    value={event.type}
                    onChange={(e) => updateEvent(index, 'type', e.target.value as OutputEventType)}
                    style={{
                      padding: '8px 12px',
                      background: '#0f1419',
                      border: `1px solid ${color}`,
                      borderRadius: '6px',
                      color: color,
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  >
                    <option value="success">On Success</option>
                    <option value="error">On Error</option>
                    <option value="complete">On Complete</option>
                    <option value="custom">Custom Event</option>
                  </select>
                </div>

                <button
                  onClick={() => removeEvent(index)}
                  style={{
                    padding: '6px',
                    background: 'rgba(220, 53, 69, 0.1)',
                    border: '1px solid rgba(220, 53, 69, 0.3)',
                    borderRadius: '6px',
                    color: '#dc3545',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Condition (optional) */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px' }}>
                  Condition (optional JavaScript expression)
                </label>
                <input
                  type="text"
                  value={event.condition || ''}
                  onChange={(e) => updateEvent(index, 'condition', e.target.value)}
                  placeholder="e.g., output.amount > 100"
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#0f1419',
                    border: '1px solid #2a3f5f',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              {/* Target Nodes */}
              <div>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '8px' }}>
                  Target Nodes (select which nodes to trigger)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {downstreamNodes.map((node) => {
                    const isSelected = event.targetNodeIds?.includes(node.id);
                    return (
                      <button
                        key={node.id}
                        onClick={() => toggleTargetNode(index, node.id)}
                        style={{
                          padding: '8px 12px',
                          background: isSelected ? `${color}20` : '#1a1a2e',
                          border: `1px solid ${isSelected ? color : '#2a3f5f'}`,
                          borderRadius: '6px',
                          color: isSelected ? color : '#fff',
                          fontSize: '12px',
                          fontWeight: isSelected ? '600' : '400',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {node.data.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Event Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
        <button
          onClick={() => addEvent('success')}
          style={{
            padding: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            color: '#10b981',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Plus size={14} />
          On Success
        </button>
        <button
          onClick={() => addEvent('error')}
          style={{
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Plus size={14} />
          On Error
        </button>
        <button
          onClick={() => addEvent('complete')}
          style={{
            padding: '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            color: '#3b82f6',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Plus size={14} />
          On Complete
        </button>
      </div>
    </div>
  );
}
