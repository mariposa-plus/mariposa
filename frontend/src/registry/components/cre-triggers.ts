/**
 * CRE Trigger Components
 * Components that start a CRE workflow execution
 */

import { ComponentSchema } from '@/types';

export const CRE_TRIGGER_COMPONENTS: Record<string, ComponentSchema> = {
  'cron-trigger': {
    id: 'cron-trigger',
    name: 'Cron Trigger',
    category: 'cre-triggers',
    description: 'Schedule-based trigger using cron expressions',
    icon: 'Clock',
    color: '#7c3aed',
    type: 'cre',
    isTrigger: true,
    handles: {
      hasTopHandle: false,
      hasBottomHandle: true,
    },
    configSchema: {
      cronExpression: {
        type: 'text',
        label: 'Cron Expression',
        placeholder: '0 */5 * * * *',
        required: true,
        helpText: 'CRE cron format: sec min hour day month weekday. Example: "0 */5 * * * *" = every 5 minutes',
      },
      timezone: {
        type: 'text',
        label: 'Timezone',
        placeholder: 'UTC',
        defaultValue: 'UTC',
        helpText: 'IANA timezone (e.g., UTC, America/New_York)',
      },
      maxRetries: {
        type: 'number',
        label: 'Max Retries',
        defaultValue: 3,
        validation: { min: 0, max: 10 },
      },
    },
    outputs: [
      { id: 'timestamp', label: 'Trigger Timestamp', type: 'string' },
      { id: 'payload', label: 'Cron Payload', type: 'object' },
    ],
  },

  'http-trigger': {
    id: 'http-trigger',
    name: 'HTTP Trigger',
    category: 'cre-triggers',
    description: 'Trigger workflow via HTTP request to endpoint',
    icon: 'Webhook',
    color: '#7c3aed',
    type: 'cre',
    isTrigger: true,
    handles: {
      hasTopHandle: false,
      hasBottomHandle: true,
    },
    configSchema: {
      path: {
        type: 'text',
        label: 'Endpoint Path',
        placeholder: '/my-workflow',
        required: true,
        helpText: 'URL path for the HTTP trigger endpoint',
      },
      method: {
        type: 'select',
        label: 'HTTP Method',
        defaultValue: 'POST',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
        ],
      },
      authType: {
        type: 'select',
        label: 'Authentication',
        defaultValue: 'none',
        options: [
          { value: 'none', label: 'None' },
          { value: 'bearer', label: 'Bearer Token' },
          { value: 'apiKey', label: 'API Key' },
        ],
      },
    },
    outputs: [
      { id: 'body', label: 'Request Body', type: 'object' },
      { id: 'headers', label: 'Request Headers', type: 'object' },
      { id: 'method', label: 'HTTP Method', type: 'string' },
    ],
  },

  'evm-log-trigger': {
    id: 'evm-log-trigger',
    name: 'EVM Log Trigger',
    category: 'cre-triggers',
    description: 'Listen for specific on-chain events (contract logs)',
    icon: 'Zap',
    color: '#7c3aed',
    type: 'cre',
    isTrigger: true,
    handles: {
      hasTopHandle: false,
      hasBottomHandle: true,
    },
    configSchema: {
      contractAddress: {
        type: 'text',
        label: 'Contract Address',
        placeholder: '0x...',
        required: true,
        validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
        helpText: 'Address of the contract emitting the event',
      },
      eventSignature: {
        type: 'text',
        label: 'Event Signature',
        placeholder: 'Transfer(address,address,uint256)',
        required: true,
        helpText: 'Solidity event signature (e.g., Transfer(address,address,uint256))',
      },
      chainSelector: {
        type: 'chain-select',
        label: 'Chain',
        required: true,
        helpText: 'The EVM chain to listen on',
      },
      fromBlock: {
        type: 'text',
        label: 'From Block',
        placeholder: 'latest',
        defaultValue: 'latest',
        helpText: 'Block number to start listening from, or "latest"',
      },
    },
    outputs: [
      { id: 'address', label: 'Contract Address', type: 'string' },
      { id: 'topics', label: 'Log Topics', type: 'array' },
      { id: 'data', label: 'Log Data', type: 'string' },
      { id: 'txHash', label: 'Transaction Hash', type: 'string' },
      { id: 'blockNumber', label: 'Block Number', type: 'number' },
    ],
  },
};
