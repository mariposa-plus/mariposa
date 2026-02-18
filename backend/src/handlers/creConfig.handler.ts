// Chain selector name to RPC URL mapping (defaults)
const DEFAULT_RPC_URLS: Record<string, string> = {
  'ethereum-testnet-sepolia': 'https://ethereum-sepolia-rpc.publicnode.com',
  'ethereum-mainnet': 'https://ethereum-rpc.publicnode.com',
  'arbitrum-testnet-sepolia': 'https://arbitrum-sepolia-rpc.publicnode.com',
  'arbitrum-mainnet': 'https://arbitrum-one-rpc.publicnode.com',
  'base-testnet-sepolia': 'https://base-sepolia-rpc.publicnode.com',
  'base-mainnet': 'https://base-rpc.publicnode.com',
  'avalanche-testnet-fuji': 'https://avalanche-fuji-c-chain-rpc.publicnode.com',
  'avalanche-mainnet': 'https://avalanche-c-chain-rpc.publicnode.com',
  'polygon-testnet-amoy': 'https://polygon-amoy-bor-rpc.publicnode.com',
  'polygon-mainnet': 'https://polygon-bor-rpc.publicnode.com',
  'optimism-testnet-sepolia': 'https://optimism-sepolia-rpc.publicnode.com',
  'optimism-mainnet': 'https://optimism-rpc.publicnode.com',
};

interface NodeConfig {
  type: string;
  data: {
    config?: Record<string, any>;
    fullConfig?: {
      component: Record<string, any>;
    };
  };
}

class CREConfigHandler {
  async execute(node: NodeConfig, execution: any, inputs: Record<string, any>): Promise<any> {
    const config = node.data?.fullConfig?.component || node.data?.config || {};

    switch (node.type) {
      case 'chain-selector': {
        const chainSelector = config.chainSelector || 'ethereum-testnet-sepolia';
        const rpcUrl = config.rpcOverride || DEFAULT_RPC_URLS[chainSelector] || '';
        const isTestnet = config.isTestnet !== false;
        return {
          success: true,
          chainSelector,
          chainName: chainSelector,
          rpcUrl,
          isTestnet,
        };
      }

      case 'contract-address':
        return {
          success: true,
          address: config.address,
          abi: config.abi,
          label: config.label,
        };

      case 'wallet-signer': {
        const signerType = config.signerType || 'envVar';
        const envVarName = config.envVarName || 'CRE_ETH_PRIVATE_KEY';
        const hasKey = !!process.env[envVarName];
        return {
          success: true,
          signerType,
          envVarName,
          keyConfigured: hasKey,
          signerAddress: hasKey ? 'Configured (hidden)' : 'Not configured',
        };
      }

      case 'rpc-endpoint':
        return {
          success: true,
          httpRpcUrl: config.httpRpcUrl,
          wsRpcUrl: config.wsRpcUrl,
          chainSelectorName: config.chainSelectorName,
        };

      default:
        return { success: true, nodeType: node.type };
    }
  }
}

export const creConfigHandler = new CREConfigHandler();
