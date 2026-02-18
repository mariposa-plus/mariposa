/**
 * CRE Capability Components
 * SDK clients for workflow logic (HTTPClient, EVMClient, etc.)
 */

import { ComponentSchema } from '@/types';

export const CRE_CAPABILITY_COMPONENTS: Record<string, ComponentSchema> = {
  'http-fetch': {
    id: 'http-fetch',
    name: 'HTTP Fetch',
    category: 'cre-capabilities',
    description: 'Make HTTP requests to external APIs with consensus support',
    icon: 'Globe',
    color: '#2563eb',
    type: 'cre',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
    },
    configSchema: {
      url: {
        type: 'text',
        label: 'URL',
        placeholder: 'https://api.example.com/data',
        required: true,
        acceptsInputVariables: true,
      },
      method: {
        type: 'select',
        label: 'Method',
        defaultValue: 'GET',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'PATCH', label: 'PATCH' },
          { value: 'DELETE', label: 'DELETE' },
        ],
      },
      headers: {
        type: 'json',
        label: 'Headers',
        placeholder: '{"Content-Type": "application/json"}',
        helpText: 'JSON object of request headers',
      },
      body: {
        type: 'json',
        label: 'Request Body',
        placeholder: '{"key": "value"}',
        dependsOn: 'method:POST',
        helpText: 'JSON request body (for POST/PUT/PATCH)',
      },
      timeout: {
        type: 'number',
        label: 'Timeout (ms)',
        defaultValue: 30000,
        validation: { min: 1000, max: 120000 },
      },
    },
    inputs: [
      { id: 'dynamicUrl', label: 'Dynamic URL', type: 'string', description: 'Override URL from upstream node' },
    ],
    outputs: [
      { id: 'body', label: 'Response Body', type: 'object' },
      { id: 'statusCode', label: 'Status Code', type: 'number' },
      { id: 'headers', label: 'Response Headers', type: 'object' },
    ],
  },

  'evm-read': {
    id: 'evm-read',
    name: 'EVM Read',
    category: 'cre-capabilities',
    description: 'Read data from smart contract (callContract)',
    icon: 'BookOpen',
    color: '#2563eb',
    type: 'cre',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
    },
    configSchema: {
      contractAddress: {
        type: 'text',
        label: 'Contract Address',
        placeholder: '0x...',
        required: true,
        validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
      },
      functionSignature: {
        type: 'text',
        label: 'Function Signature',
        placeholder: 'latestValue()',
        required: true,
        helpText: 'Solidity function signature (e.g., balanceOf(address))',
      },
      args: {
        type: 'json',
        label: 'Function Arguments',
        placeholder: '[]',
        helpText: 'JSON array of function arguments',
      },
      chainSelector: {
        type: 'chain-select',
        label: 'Chain',
        required: true,
      },
      blockNumber: {
        type: 'text',
        label: 'Block Number',
        placeholder: 'LAST_FINALIZED_BLOCK_NUMBER',
        defaultValue: 'LAST_FINALIZED_BLOCK_NUMBER',
        helpText: 'Block to read from. Use LAST_FINALIZED_BLOCK_NUMBER for latest finalized.',
      },
    },
    outputs: [
      { id: 'result', label: 'Call Result', type: 'any' },
      { id: 'blockNumber', label: 'Block Number', type: 'number' },
    ],
  },

  'evm-write': {
    id: 'evm-write',
    name: 'EVM Write',
    category: 'cre-capabilities',
    description: 'Write data on-chain via report (writeReport + IReceiver)',
    icon: 'Send',
    color: '#2563eb',
    type: 'cre',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
    },
    configSchema: {
      contractAddress: {
        type: 'text',
        label: 'Contract Address',
        placeholder: '0x...',
        required: true,
        validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
        helpText: 'Address of the IReceiver consumer contract',
      },
      dataToEncode: {
        type: 'json',
        label: 'Data to Encode',
        placeholder: '{"types": ["uint256"], "values": [42]}',
        required: true,
        helpText: 'ABI types and values to encode for the report',
      },
      chainSelector: {
        type: 'chain-select',
        label: 'Chain',
        required: true,
      },
      gasLimit: {
        type: 'number',
        label: 'Gas Limit',
        defaultValue: 1000000,
        validation: { min: 21000, max: 30000000 },
      },
    },
    inputs: [
      { id: 'reportData', label: 'Report Data', type: 'any', description: 'Data from upstream to write on-chain' },
    ],
    outputs: [
      { id: 'txHash', label: 'Transaction Hash', type: 'string' },
      { id: 'success', label: 'Success', type: 'boolean' },
    ],
  },

  'node-mode': {
    id: 'node-mode',
    name: 'Node Mode',
    category: 'cre-capabilities',
    description: 'Execute code on individual DON nodes with consensus aggregation',
    icon: 'Server',
    color: '#2563eb',
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
          { value: 'median', label: 'Median' },
          { value: 'mean', label: 'Mean' },
          { value: 'mode', label: 'Mode' },
        ],
        helpText: 'How to aggregate results from individual nodes',
      },
      minResponses: {
        type: 'number',
        label: 'Min Node Responses',
        defaultValue: 2,
        validation: { min: 1, max: 31 },
        helpText: 'Minimum number of node responses required for consensus',
      },
      nodeLogic: {
        type: 'code',
        label: 'Node Logic',
        placeholder: '// Code executed on each node\nreturn 42;',
        helpText: 'JavaScript code to execute on each DON node',
      },
    },
    outputs: [
      { id: 'aggregatedValue', label: 'Aggregated Value', type: 'any' },
      { id: 'reportCount', label: 'Report Count', type: 'number' },
    ],
  },

  'secrets-access': {
    id: 'secrets-access',
    name: 'Secrets Access',
    category: 'cre-capabilities',
    description: 'Access secrets stored in Vault DON',
    icon: 'KeyRound',
    color: '#2563eb',
    type: 'cre',
    handles: {
      hasTopHandle: true,
      hasBottomHandle: true,
    },
    configSchema: {
      secretName: {
        type: 'text',
        label: 'Secret Name',
        placeholder: 'API_KEY',
        required: true,
        helpText: 'Name of the secret as declared in secrets.yaml',
      },
    },
    outputs: [
      { id: 'value', label: 'Secret Value', type: 'string' },
    ],
  },
};
