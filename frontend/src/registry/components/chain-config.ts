/**
 * Chain Config Components
 * Configuration components for chain selection, contracts, wallets, and RPC
 */

import { ComponentSchema } from '@/types';

export const CHAIN_CONFIG_COMPONENTS: Record<string, ComponentSchema> = {
  'chain-selector': {
    id: 'chain-selector',
    name: 'Chain Selector',
    category: 'chain-config',
    description: 'Pick target EVM chain for workflow operations',
    icon: 'Network',
    color: '#6b7280',
    type: 'config',
    handles: {
      hasTopHandle: false,
      hasBottomHandle: true,
      hasRightHandle: true,
    },
    configSchema: {
      chainSelector: {
        type: 'chain-select',
        label: 'Chain',
        required: true,
        helpText: 'Select the target EVM chain',
      },
      isTestnet: {
        type: 'toggle',
        label: 'Is Testnet',
        defaultValue: true,
        helpText: 'Whether this is a testnet chain',
      },
      rpcOverride: {
        type: 'text',
        label: 'RPC Override',
        placeholder: 'https://custom-rpc.example.com',
        helpText: 'Override the default RPC endpoint for this chain',
      },
    },
    outputs: [
      { id: 'chainSelector', label: 'Chain Selector', type: 'string' },
      { id: 'chainName', label: 'Chain Name', type: 'string' },
      { id: 'rpcUrl', label: 'RPC URL', type: 'string' },
      { id: 'isTestnet', label: 'Is Testnet', type: 'boolean' },
    ],
  },

  'contract-address': {
    id: 'contract-address',
    name: 'Contract Address',
    category: 'chain-config',
    description: 'Reference a deployed contract with its ABI',
    icon: 'Hash',
    color: '#6b7280',
    type: 'config',
    handles: {
      hasTopHandle: false,
      hasBottomHandle: true,
      hasRightHandle: true,
    },
    configSchema: {
      address: {
        type: 'text',
        label: 'Contract Address',
        placeholder: '0x...',
        required: true,
        validation: { pattern: '^0x[a-fA-F0-9]{40}$' },
      },
      label: {
        type: 'text',
        label: 'Label',
        placeholder: 'My Contract',
        helpText: 'A friendly label for this contract reference',
      },
      abi: {
        type: 'json',
        label: 'Contract ABI',
        placeholder: '[{"type": "function", "name": "..."}]',
        helpText: 'Paste the contract ABI JSON array',
      },
    },
    outputs: [
      { id: 'address', label: 'Address', type: 'string' },
      { id: 'abi', label: 'ABI', type: 'object' },
    ],
  },

  'wallet-signer': {
    id: 'wallet-signer',
    name: 'Wallet / Signer',
    category: 'chain-config',
    description: 'Configure the EOA wallet for transactions',
    icon: 'Wallet',
    color: '#6b7280',
    type: 'config',
    handles: {
      hasTopHandle: false,
      hasBottomHandle: true,
      hasRightHandle: true,
    },
    configSchema: {
      signerType: {
        type: 'select',
        label: 'Signer Type',
        defaultValue: 'envVar',
        options: [
          { value: 'envVar', label: 'Environment Variable' },
          { value: 'secret', label: 'CRE Secret (Vault DON)' },
        ],
      },
      envVarName: {
        type: 'text',
        label: 'Env Variable Name',
        placeholder: 'CRE_ETH_PRIVATE_KEY',
        defaultValue: 'CRE_ETH_PRIVATE_KEY',
        dependsOn: 'signerType:envVar',
        helpText: 'Environment variable holding the private key (64-char hex, no 0x prefix)',
      },
      secretName: {
        type: 'text',
        label: 'Secret Name',
        placeholder: 'PRIVATE_KEY',
        dependsOn: 'signerType:secret',
        helpText: 'Name of the secret in Vault DON',
      },
    },
    outputs: [
      { id: 'signerAddress', label: 'Signer Address', type: 'string' },
    ],
  },

  'rpc-endpoint': {
    id: 'rpc-endpoint',
    name: 'RPC Endpoint',
    category: 'chain-config',
    description: 'Configure chain RPC URL for project.yaml',
    icon: 'Plug',
    color: '#6b7280',
    type: 'config',
    handles: {
      hasTopHandle: false,
      hasBottomHandle: true,
      hasRightHandle: true,
    },
    configSchema: {
      chainSelectorName: {
        type: 'chain-select',
        label: 'Chain',
        required: true,
      },
      httpRpcUrl: {
        type: 'text',
        label: 'HTTP RPC URL',
        placeholder: 'https://ethereum-sepolia-rpc.publicnode.com',
        required: true,
      },
      wsRpcUrl: {
        type: 'text',
        label: 'WebSocket RPC URL',
        placeholder: 'wss://ethereum-sepolia-rpc.publicnode.com',
        helpText: 'Optional WebSocket RPC endpoint',
      },
    },
    outputs: [
      { id: 'httpRpcUrl', label: 'HTTP RPC URL', type: 'string' },
      { id: 'wsRpcUrl', label: 'WS RPC URL', type: 'string' },
      { id: 'chainSelectorName', label: 'Chain Name', type: 'string' },
    ],
  },
};
