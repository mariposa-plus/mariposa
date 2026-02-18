export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  email: string;
}

export interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

// Component classification
export type ComponentType = 'cre' | 'solidity' | 'config';

// Component categories (CRE 5-category system)
export type ComponentCategory =
  | 'cre-triggers'
  | 'cre-capabilities'
  | 'cre-logic'
  | 'solidity-contracts'
  | 'chain-config';

// Node states
export type NodeState = 'draft' | 'configured' | 'ready' | 'error';

// EVM chain identifiers
export type EVMChain = 'ethereum-testnet-sepolia' | 'ethereum-mainnet' | 'arbitrum-testnet-sepolia' | 'arbitrum-mainnet' | 'base-testnet-sepolia' | 'base-mainnet' | 'avalanche-testnet-fuji' | 'avalanche-mainnet' | 'polygon-testnet-amoy' | 'polygon-mainnet' | 'optimism-testnet-sepolia' | 'optimism-mainnet';

// CRE NodeType — all component types
export type NodeType =
  // CRE Triggers
  | 'cron-trigger' | 'http-trigger' | 'evm-log-trigger'

  // CRE Capabilities
  | 'http-fetch' | 'evm-read' | 'evm-write' | 'node-mode' | 'secrets-access'

  // CRE Logic
  | 'consensus-aggregation' | 'data-transform' | 'condition' | 'abi-encode' | 'abi-decode'

  // Solidity Contracts
  | 'ireceiver-contract' | 'price-feed-consumer' | 'custom-data-consumer' | 'proof-of-reserve' | 'event-emitter'

  // Chain Config
  | 'chain-selector' | 'contract-address' | 'wallet-signer' | 'rpc-endpoint';

// Solidity contract metadata
export interface SolidityContractMeta {
  abi?: any[];
  bytecode?: string;
  address?: string;
  network?: string;
  txHash?: string;
}

export interface NodeData {
  id: string;
  type: NodeType;
  componentType?: ComponentType;
  state?: NodeState;
  label: string;
  config?: Record<string, any>;
  fullConfig?: NodeConfiguration;
  isTrigger?: boolean;
  // CRE-specific
  creProjectId?: string;
  solidityCode?: string;
  contractMeta?: SolidityContractMeta;
}

export interface PipelineNode {
  id: string;
  type: NodeType;
  componentType?: ComponentType;
  state?: NodeState;
  position: { x: number; y: number };
  data: NodeData;
}

// Input/Output Configuration Types

// Field mapping from source node to target node
export interface FieldMapping {
  sourceNodeId: string;
  sourceField: string;
  targetField: string;
  transform?: 'none' | 'stringify' | 'parse' | 'uppercase' | 'lowercase' | 'custom';
  customTransform?: string;
}

// Input configuration for a node
export interface InputConfig {
  mappings: FieldMapping[];
  requiredFields: string[];
  validatedAt?: string;
}

// Output route
export interface OutputRoute {
  targetNodeId: string;
  condition?: string;
  dataMapping?: Record<string, string>;
}

// Output configuration
export interface OutputConfig {
  routes: OutputRoute[];
  defaultFields?: string[];
}

// Complete node configuration
export interface NodeConfiguration {
  input?: InputConfig;
  component: Record<string, any>;
  output?: OutputConfig;
}

// Edge condition types
export type EdgeConditionType = 'immediate' | 'delay' | 'event' | 'approval';

// Edge condition configuration
export interface EdgeCondition {
  type: EdgeConditionType;
  delayMs?: number;
  delayUnit?: 'seconds' | 'minutes' | 'hours' | 'days';
  delayValue?: number;
  eventType?: string;
  eventConfig?: any;
  approvalConfig?: {
    required: boolean;
    approvers?: string[];
    minApprovals?: number;
    message?: string;
  };
}

export interface PipelineEdge {
  id: string;
  source: string;
  sourceHandle?: string | null;
  target: string;
  targetHandle?: string | null;
  condition?: EdgeCondition;
  animated?: boolean;
  style?: any;
}

export interface Pipeline {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  isActive: boolean;
  lastExecutedAt?: string;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
}

// Component Schema System
export interface ComponentSchema {
  id: NodeType;
  name: string;
  category: ComponentCategory;
  description: string;
  icon: string; // lucide-react icon name
  color: string;
  type: ComponentType;
  isTrigger?: boolean;

  // Connection points
  handles: {
    hasTopHandle?: boolean;
    hasBottomHandle?: boolean;
    hasLeftHandle?: boolean;
    hasRightHandle?: boolean;
  };

  // Configuration schema
  configSchema?: Record<string, ConfigField>;

  // Input/Output definitions
  inputs?: ComponentIO[];
  outputs?: ComponentIO[];
}

// Field configuration for component config forms
export interface ConfigField {
  type: 'text' | 'password' | 'number' | 'select' | 'textarea' | 'toggle' | 'multi-select' | 'json' | 'code' | 'text-template' | 'prompt-template' | 'monaco-solidity' | 'chain-select';
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customValidation?: string;
  };
  helpText?: string;
  dependsOn?: string;
  acceptsInputVariables?: boolean;
}

// Component inputs/outputs
export interface ComponentIO {
  id: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file' | 'any';
  required?: boolean;
  description?: string;
}

// CRE Project types (for frontend store)
export interface CREProject {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  workspacePath: string;
  status: 'created' | 'ready' | 'simulating' | 'error';
  errorMessage?: string;
  lastSimulatedAt?: string;
  simulationLogs?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CREWorkflow {
  _id: string;
  projectId: string;
  userId: string;
  pipelineId: string;
  generatedCode?: string;
  generatedAt?: string;
  status: 'pending' | 'generated' | 'valid' | 'invalid';
  validationErrors?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CREContract {
  _id: string;
  projectId: string;
  userId: string;
  nodeId: string;
  contractName: string;
  soliditySource: string;
  abi?: any[];
  bytecode?: string;
  deployedAddress?: string;
  network?: string;
  deployedTxHash?: string;
  compilationErrors?: string[];
  status: 'draft' | 'compiling' | 'compiled' | 'deploying' | 'deployed' | 'failed';
  createdAt: string;
  updatedAt: string;
}
