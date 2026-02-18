/**
 * CRE Component Registry
 * Aggregates all 5 CRE component categories
 */

import { ComponentSchema, ComponentCategory } from '@/types';
import { CRE_TRIGGER_COMPONENTS } from './cre-triggers';
import { CRE_CAPABILITY_COMPONENTS } from './cre-capabilities';
import { CRE_LOGIC_COMPONENTS } from './cre-logic';
import { SOLIDITY_CONTRACT_COMPONENTS } from './solidity-contracts';
import { CHAIN_CONFIG_COMPONENTS } from './chain-config';

// Aggregate all components
export const ALL_COMPONENTS: Record<string, ComponentSchema> = {
  ...CRE_TRIGGER_COMPONENTS,
  ...CRE_CAPABILITY_COMPONENTS,
  ...CRE_LOGIC_COMPONENTS,
  ...SOLIDITY_CONTRACT_COMPONENTS,
  ...CHAIN_CONFIG_COMPONENTS,
};

// Components organized by category
export const COMPONENTS_BY_CATEGORY: Record<ComponentCategory, Record<string, ComponentSchema>> = {
  'cre-triggers': CRE_TRIGGER_COMPONENTS,
  'cre-capabilities': CRE_CAPABILITY_COMPONENTS,
  'cre-logic': CRE_LOGIC_COMPONENTS,
  'solidity-contracts': SOLIDITY_CONTRACT_COMPONENTS,
  'chain-config': CHAIN_CONFIG_COMPONENTS,
};

// Category metadata
export interface CategoryMetadata {
  id: ComponentCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const CATEGORY_METADATA: Record<ComponentCategory, CategoryMetadata> = {
  'cre-triggers': {
    id: 'cre-triggers',
    name: 'CRE Triggers',
    icon: 'Zap',
    color: '#7c3aed',
    description: 'Start CRE workflow execution',
  },
  'cre-capabilities': {
    id: 'cre-capabilities',
    name: 'CRE Capabilities',
    icon: 'Cpu',
    color: '#2563eb',
    description: 'Chainlink SDK capability calls',
  },
  'cre-logic': {
    id: 'cre-logic',
    name: 'CRE Logic',
    icon: 'GitBranch',
    color: '#16a34a',
    description: 'Workflow logic and data transformation',
  },
  'solidity-contracts': {
    id: 'solidity-contracts',
    name: 'Solidity Contracts',
    icon: 'FileCode2',
    color: '#ea580c',
    description: 'On-chain Solidity consumer contracts',
  },
  'chain-config': {
    id: 'chain-config',
    name: 'Chain Config',
    icon: 'Settings',
    color: '#6b7280',
    description: 'Chain and connection configuration',
  },
};

// Helper functions
export function getComponentById(id: string): ComponentSchema | undefined {
  return ALL_COMPONENTS[id];
}

export function getComponentsByCategory(category: ComponentCategory): ComponentSchema[] {
  return Object.values(COMPONENTS_BY_CATEGORY[category] || {});
}

export function getTriggerComponents(): ComponentSchema[] {
  return Object.values(ALL_COMPONENTS).filter(c => c.isTrigger);
}

export function getCREComponents(): ComponentSchema[] {
  return Object.values(ALL_COMPONENTS).filter(c => c.type === 'cre');
}

export function getSolidityComponents(): ComponentSchema[] {
  return Object.values(ALL_COMPONENTS).filter(c => c.type === 'solidity');
}

export function getConfigComponents(): ComponentSchema[] {
  return Object.values(ALL_COMPONENTS).filter(c => c.type === 'config');
}

// Export individual category registries
export {
  CRE_TRIGGER_COMPONENTS,
  CRE_CAPABILITY_COMPONENTS,
  CRE_LOGIC_COMPONENTS,
  SOLIDITY_CONTRACT_COMPONENTS,
  CHAIN_CONFIG_COMPONENTS,
};
