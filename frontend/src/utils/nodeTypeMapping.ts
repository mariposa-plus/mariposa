/**
 * Node Type Mapping Utility
 * Maps NodeType to React component for rendering in pipeline
 * All CRE components use GenericNode
 */

import { GenericNode } from '@/components/nodes/GenericNode';

export const createNodeTypes = () => ({
  // CRE Triggers
  'cron-trigger': GenericNode,
  'http-trigger': GenericNode,
  'evm-log-trigger': GenericNode,

  // CRE Capabilities
  'http-fetch': GenericNode,
  'evm-read': GenericNode,
  'evm-write': GenericNode,
  'node-mode': GenericNode,
  'secrets-access': GenericNode,

  // CRE Logic
  'consensus-aggregation': GenericNode,
  'data-transform': GenericNode,
  'condition': GenericNode,
  'abi-encode': GenericNode,
  'abi-decode': GenericNode,

  // Solidity Contracts
  'ireceiver-contract': GenericNode,
  'price-feed-consumer': GenericNode,
  'custom-data-consumer': GenericNode,
  'proof-of-reserve': GenericNode,
  'event-emitter': GenericNode,

  // Chain Config
  'chain-selector': GenericNode,
  'contract-address': GenericNode,
  'wallet-signer': GenericNode,
  'rpc-endpoint': GenericNode,
});

export const nodeTypes = createNodeTypes();
