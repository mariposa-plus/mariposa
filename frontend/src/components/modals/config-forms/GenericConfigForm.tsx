'use client';

import { useState, useEffect, useMemo } from 'react';
import { ComponentSchema, PipelineNode } from '@/types';
import { ConfigFieldRenderer } from './ConfigFieldRenderer';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { AvailableVariable } from './PromptTemplateField';

interface GenericConfigFormProps {
  componentSchema: ComponentSchema;
  initialConfig?: Record<string, any>;
  inputMappings?: Array<{ sourceField: string; targetField: string; sourceNodeId: string }>; // NEW
  upstreamNodes?: PipelineNode[]; // NEW
  onSave: (config: Record<string, any>) => void;
}

export function GenericConfigForm({
  componentSchema,
  initialConfig = {},
  inputMappings = [],
  upstreamNodes = [],
  onSave,
}: GenericConfigFormProps) {
  const [config, setConfig] = useState<Record<string, any>>(initialConfig);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Extract available variables from input mappings
  const availableVariables: AvailableVariable[] = useMemo(() => {
    return inputMappings.map((mapping) => {
      const sourceNode = upstreamNodes.find((n) => n.id === mapping.sourceNodeId);
      return {
        id: mapping.targetField,
        label: mapping.sourceField,
        type: 'string', // TODO: Get actual type from source field
        sourceNode: sourceNode?.data?.label || sourceNode?.type || mapping.sourceNodeId,
      };
    });
  }, [inputMappings, upstreamNodes]);

  // Initialize with default values
  useEffect(() => {
    if (componentSchema.configSchema) {
      const configWithDefaults = { ...initialConfig };
      Object.entries(componentSchema.configSchema).forEach(([fieldName, fieldDef]) => {
        if (configWithDefaults[fieldName] === undefined && fieldDef.defaultValue !== undefined) {
          configWithDefaults[fieldName] = fieldDef.defaultValue;
        }
      });
      setConfig(configWithDefaults);
    }
  }, [componentSchema]);

  const handleFieldChange = (fieldName: string, value: any) => {
    const newConfig = {
      ...config,
      [fieldName]: value,
    };

    setConfig(newConfig);

    // Immediately propagate to parent to avoid stale state issues
    onSave(newConfig);

    setHasChanges(true);

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (componentSchema.configSchema) {
      Object.entries(componentSchema.configSchema).forEach(([fieldName, fieldDef]) => {
        // Skip validation for hidden conditional fields
        if (!shouldShowField(fieldName, fieldDef)) {
          return;
        }

        const value = config[fieldName];

        // Required field validation
        if (fieldDef.required && (value === undefined || value === '' || value === null)) {
          newErrors[fieldName] = `${fieldDef.label} is required`;
          return;
        }

        // Skip validation if field is empty and not required
        if (!value) return;

        // Number validation
        if (fieldDef.type === 'number' && fieldDef.validation) {
          const numValue = Number(value);
          if (fieldDef.validation.min !== undefined && numValue < fieldDef.validation.min) {
            newErrors[fieldName] = `Minimum value is ${fieldDef.validation.min}`;
          }
          if (fieldDef.validation.max !== undefined && numValue > fieldDef.validation.max) {
            newErrors[fieldName] = `Maximum value is ${fieldDef.validation.max}`;
          }
        }

        // Pattern validation
        if (fieldDef.validation?.pattern && typeof value === 'string') {
          const regex = new RegExp(fieldDef.validation.pattern);
          if (!regex.test(value)) {
            newErrors[fieldName] = `Invalid format for ${fieldDef.label}`;
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // No longer needed - form auto-saves on field change
  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (validateConfig()) {
  //     onSave(config);
  //     setHasChanges(false);
  //   }
  // };

  if (!componentSchema.configSchema) {
    return (
      <div
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: '#888',
        }}
      >
        <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <p>No configuration required for this component</p>
      </div>
    );
  }

  // Check field dependencies to determine visibility
  const shouldShowField = (fieldName: string, fieldDef: any): boolean => {
    if (!fieldDef.dependsOn) return true;

    // Parse dependsOn (format: "fieldName:value" or just "fieldName")
    const [depField, depValue] = fieldDef.dependsOn.split(':');
    const currentDepValue = config[depField];

    if (depValue) {
      // Check for specific value
      return String(currentDepValue) === depValue || currentDepValue === (depValue === 'true');
    } else {
      // Just check if field has a truthy value
      return !!currentDepValue;
    }
  };

  const errorCount = Object.keys(errors).length;
  const fieldCount = Object.keys(componentSchema.configSchema).length;
  const visibleFields = Object.entries(componentSchema.configSchema).filter(([name, def]) =>
    shouldShowField(name, def)
  );

  return (
    <div style={{ padding: '20px' }}>
      {/* Component Description */}
      {componentSchema.description && (
        <div
          style={{
            marginBottom: '24px',
            padding: '12px 16px',
            background: '#1a1a2e',
            border: '1px solid #2a3f5f',
            borderLeft: `4px solid ${componentSchema.color}`,
            borderRadius: '6px',
            fontSize: '14px',
            color: '#aaa',
            lineHeight: '1.6',
          }}
        >
          {componentSchema.description}
        </div>
      )}

      {/* Validation Summary */}
      {errorCount > 0 && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            background: '#ef444420',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            color: '#ef4444',
          }}
        >
          <AlertCircle size={18} />
          <span>
            {errorCount} validation error{errorCount > 1 ? 's' : ''} found. Please fix them before saving.
          </span>
        </div>
      )}

      {/* Config Fields */}
      <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
        {visibleFields.map(([fieldName, fieldDef]) => (
          <ConfigFieldRenderer
            key={fieldName}
            fieldName={fieldName}
            fieldDef={fieldDef}
            value={config[fieldName]}
            onChange={(value) => handleFieldChange(fieldName, value)}
            error={errors[fieldName]}
            availableVariables={availableVariables}
          />
        ))}

      </div>

      {/* Status Indicator - Removed duplicate save button */}
      {/* The modal's footer has the main "Save Configuration" button */}
    </div>
  );
}
