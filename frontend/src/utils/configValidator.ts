import { ConfigField, ComponentSchema } from '@/types';

/**
 * Configuration Validation Utilities
 * Validates component configurations against their schemas
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate a single field value against its definition
 */
export function validateField(
  fieldName: string,
  value: any,
  fieldDef: ConfigField
): ValidationError | null {
  // Required field validation
  if (fieldDef.required && (value === undefined || value === '' || value === null)) {
    return {
      field: fieldName,
      message: `${fieldDef.label} is required`,
    };
  }

  // Skip further validation if field is empty and not required
  if (!value && !fieldDef.required) return null;

  // Number validation
  if (fieldDef.type === 'number') {
    const numValue = Number(value);

    if (isNaN(numValue)) {
      return {
        field: fieldName,
        message: `${fieldDef.label} must be a valid number`,
      };
    }

    if (fieldDef.validation) {
      if (fieldDef.validation.min !== undefined && numValue < fieldDef.validation.min) {
        return {
          field: fieldName,
          message: `${fieldDef.label} must be at least ${fieldDef.validation.min}`,
        };
      }

      if (fieldDef.validation.max !== undefined && numValue > fieldDef.validation.max) {
        return {
          field: fieldName,
          message: `${fieldDef.label} must be at most ${fieldDef.validation.max}`,
        };
      }
    }
  }

  // Pattern validation (for text fields)
  if (fieldDef.validation?.pattern && typeof value === 'string') {
    try {
      const regex = new RegExp(fieldDef.validation.pattern);
      if (!regex.test(value)) {
        return {
          field: fieldName,
          message: `${fieldDef.label} has an invalid format`,
        };
      }
    } catch (e) {
      console.error(`Invalid regex pattern for field ${fieldName}:`, fieldDef.validation.pattern);
    }
  }

  // JSON validation
  if (fieldDef.type === 'json' && typeof value === 'string') {
    try {
      JSON.parse(value);
    } catch (e) {
      return {
        field: fieldName,
        message: `${fieldDef.label} must be valid JSON`,
      };
    }
  }

  // Multi-select validation (ensure it's an array)
  if (fieldDef.type === 'multi-select' && value !== undefined && !Array.isArray(value)) {
    return {
      field: fieldName,
      message: `${fieldDef.label} must be an array of values`,
    };
  }

  return null;
}

/**
 * Validate entire configuration against component schema
 */
export function validateConfig(
  config: Record<string, any>,
  componentSchema: ComponentSchema
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!componentSchema.configSchema) {
    return errors; // No schema to validate against
  }

  Object.entries(componentSchema.configSchema).forEach(([fieldName, fieldDef]) => {
    const error = validateField(fieldName, config[fieldName], fieldDef);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
}

/**
 * Get validation errors as a map of field name to error message
 */
export function getValidationErrors(
  config: Record<string, any>,
  componentSchema: ComponentSchema
): Record<string, string> {
  const errors = validateConfig(config, componentSchema);
  const errorMap: Record<string, string> = {};

  errors.forEach((error) => {
    errorMap[error.field] = error.message;
  });

  return errorMap;
}

/**
 * Check if configuration is valid
 */
export function isConfigValid(
  config: Record<string, any>,
  componentSchema: ComponentSchema
): boolean {
  const errors = validateConfig(config, componentSchema);
  return errors.length === 0;
}

/**
 * Get default configuration based on schema
 */
export function getDefaultConfig(componentSchema: ComponentSchema): Record<string, any> {
  const defaultConfig: Record<string, any> = {};

  if (!componentSchema.configSchema) {
    return defaultConfig;
  }

  Object.entries(componentSchema.configSchema).forEach(([fieldName, fieldDef]) => {
    if (fieldDef.defaultValue !== undefined) {
      defaultConfig[fieldName] = fieldDef.defaultValue;
    }
  });

  return defaultConfig;
}

/**
 * Merge user config with defaults
 */
export function mergeWithDefaults(
  userConfig: Record<string, any>,
  componentSchema: ComponentSchema
): Record<string, any> {
  const defaults = getDefaultConfig(componentSchema);
  return { ...defaults, ...userConfig };
}
