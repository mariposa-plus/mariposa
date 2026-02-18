/**
 * CRE Logic Components
 * Workflow control flow, data transformation, and encoding
 */

import { ComponentSchema } from '@/types';

export const CRE_LOGIC_COMPONENTS: Record<string, ComponentSchema> = {
  'consensus-aggregation': {
    id: 'consensus-aggregation',
    name: 'Consensus Aggregation',
    category: 'cre-logic',
    description: 'Configure aggregation strategy for DON consensus',
    icon: 'Layers',
    color: '#16a34a',
    type: 'cre',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
    },
    configSchema: {
      aggregationMethod: {
        type: 'select',
        label: 'Aggregation Method',
        defaultValue: 'median',
        required: true,
        options: [
          { value: 'median', label: 'Median (consensusMedianAggregation)' },
          { value: 'mode', label: 'Mode' },
          { value: 'custom', label: 'Custom Expression' },
        ],
      },
      customExpression: {
        type: 'code',
        label: 'Custom Aggregation',
        placeholder: '// (values: number[]) => number\nreturn values[0];',
        dependsOn: 'aggregationMethod:custom',
        helpText: 'Custom aggregation function that takes array of values and returns aggregated result',
      },
      minResponses: {
        type: 'number',
        label: 'Min Responses',
        defaultValue: 2,
        validation: { min: 1, max: 31 },
      },
    },
    inputs: [
      { id: 'values', label: 'Values to Aggregate', type: 'array' },
    ],
    outputs: [
      { id: 'aggregatedValue', label: 'Aggregated Value', type: 'any' },
      { id: 'reportCount', label: 'Report Count', type: 'number' },
    ],
  },

  'data-transform': {
    id: 'data-transform',
    name: 'Data Transform',
    category: 'cre-logic',
    description: 'Parse, transform, encode/decode data between capabilities',
    icon: 'Shuffle',
    color: '#16a34a',
    type: 'cre',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
    },
    configSchema: {
      transformExpression: {
        type: 'code',
        label: 'Transform Expression',
        placeholder: '// Access input via "data"\nconst result = JSON.parse(data.body);\nreturn result.price;',
        required: true,
        helpText: 'JavaScript expression. Access upstream data via "data" variable.',
      },
      outputSchema: {
        type: 'json',
        label: 'Output Schema',
        placeholder: '{"type": "number"}',
        helpText: 'Optional JSON schema describing the output shape',
      },
    },
    inputs: [
      { id: 'data', label: 'Input Data', type: 'any' },
    ],
    outputs: [
      { id: 'transformed', label: 'Transformed Data', type: 'any' },
    ],
  },

  'condition': {
    id: 'condition',
    name: 'Condition',
    category: 'cre-logic',
    description: 'If/else branching based on data values',
    icon: 'GitBranch',
    color: '#16a34a',
    type: 'cre',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
      hasLeftHandle: true,
      hasRightHandle: true,
    },
    configSchema: {
      expression: {
        type: 'code',
        label: 'Condition Expression',
        placeholder: '// Return true or false\nreturn data.price > 1000;',
        required: true,
        helpText: 'JavaScript expression that evaluates to true/false. Access input via "data".',
      },
      trueLabel: {
        type: 'text',
        label: 'True Branch Label',
        defaultValue: 'true',
      },
      falseLabel: {
        type: 'text',
        label: 'False Branch Label',
        defaultValue: 'false',
      },
    },
    inputs: [
      { id: 'data', label: 'Input Data', type: 'any' },
    ],
    outputs: [
      { id: 'true', label: 'True Branch', type: 'any' },
      { id: 'false', label: 'False Branch', type: 'any' },
    ],
  },

  'abi-encode': {
    id: 'abi-encode',
    name: 'ABI Encode',
    category: 'cre-logic',
    description: 'Encode data for on-chain writes (abi.encode)',
    icon: 'Code2',
    color: '#16a34a',
    type: 'cre',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
    },
    configSchema: {
      types: {
        type: 'text',
        label: 'ABI Types',
        placeholder: 'uint256, address, bytes32',
        required: true,
        helpText: 'Comma-separated Solidity types (e.g., uint256, address, bytes32)',
      },
      values: {
        type: 'json',
        label: 'Values',
        placeholder: '[42, "0x...", "0x..."]',
        required: true,
        helpText: 'JSON array of values matching the types',
        acceptsInputVariables: true,
      },
    },
    inputs: [
      { id: 'dynamicValues', label: 'Dynamic Values', type: 'array', description: 'Override values from upstream' },
    ],
    outputs: [
      { id: 'encoded', label: 'Encoded Data', type: 'string' },
    ],
  },

  'abi-decode': {
    id: 'abi-decode',
    name: 'ABI Decode',
    category: 'cre-logic',
    description: 'Decode data from on-chain reads',
    icon: 'FileCode',
    color: '#16a34a',
    type: 'cre',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
    },
    configSchema: {
      types: {
        type: 'text',
        label: 'ABI Types',
        placeholder: 'uint256, address, bytes32',
        required: true,
        helpText: 'Comma-separated Solidity types to decode',
      },
      encodedData: {
        type: 'text',
        label: 'Encoded Data',
        placeholder: '0x...',
        helpText: 'Hex-encoded data to decode (can be provided from upstream)',
        acceptsInputVariables: true,
      },
    },
    inputs: [
      { id: 'data', label: 'Encoded Data', type: 'string', description: 'Hex-encoded data from upstream' },
    ],
    outputs: [
      { id: 'decoded', label: 'Decoded Values', type: 'object' },
    ],
  },
};
