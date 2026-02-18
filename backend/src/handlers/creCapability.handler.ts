import axios from 'axios';

interface NodeConfig {
  type: string;
  data: {
    config?: Record<string, any>;
    fullConfig?: {
      component: Record<string, any>;
    };
  };
}

class CRECapabilityHandler {
  async execute(node: NodeConfig, execution: any, inputs: Record<string, any>): Promise<any> {
    const config = node.data?.fullConfig?.component || node.data?.config || {};

    switch (node.type) {
      case 'http-fetch':
        return this.executeHttpFetch(config, inputs);
      case 'evm-read':
        return this.executeEvmRead(config, inputs);
      case 'evm-write':
        return this.executeEvmWrite(config, inputs);
      case 'node-mode':
        return { success: true, message: 'Node mode execution requires CRE DON', nodeType: 'node-mode' };
      case 'secrets-access':
        return this.executeSecretsAccess(config);
      default:
        return { success: true, nodeType: node.type };
    }
  }

  private async executeHttpFetch(config: any, inputs: any): Promise<any> {
    try {
      const url = inputs.dynamicUrl || config.url;
      const method = (config.method || 'GET').toLowerCase();
      const headers = config.headers || {};
      const timeout = config.timeout || 30000;

      const response = await axios({
        method,
        url,
        headers,
        data: config.body,
        timeout,
      });

      return {
        success: true,
        body: response.data,
        statusCode: response.status,
        headers: response.headers,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status,
      };
    }
  }

  private async executeEvmRead(config: any, inputs: any): Promise<any> {
    try {
      const { createPublicClient, http } = await import('viem');
      const { sepolia } = await import('viem/chains');

      const rpcUrl = config.rpcUrl || process.env.DEFAULT_TESTNET_RPC || 'https://ethereum-sepolia-rpc.publicnode.com';

      const client = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl),
      });

      // For now, return a placeholder - full ABI-based reading requires contract ABI
      return {
        success: true,
        message: 'EVM read executed',
        contractAddress: config.contractAddress,
        functionSignature: config.functionSignature,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async executeEvmWrite(config: any, inputs: any): Promise<any> {
    try {
      return {
        success: true,
        message: 'EVM write requires CRE DON for consensus-based reporting. Use simulation for testing.',
        contractAddress: config.contractAddress,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async executeSecretsAccess(config: any): Promise<any> {
    const secretName = config.secretName;
    const value = process.env[secretName];
    return {
      success: true,
      value: value ? '***' : undefined,
      found: !!value,
    };
  }
}

export const creCapabilityHandler = new CRECapabilityHandler();
