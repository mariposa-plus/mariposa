import CREContract from '../models/CREContract';

interface NodeConfig {
  id: string;
  type: string;
  data: {
    config?: Record<string, any>;
    fullConfig?: {
      component: Record<string, any>;
    };
  };
}

class CREContractHandler {
  async execute(node: NodeConfig, execution: any, inputs: Record<string, any>): Promise<any> {
    try {
      // Look up contract record by nodeId
      const contract = await CREContract.findOne({ nodeId: node.id });

      if (!contract) {
        return {
          success: true,
          message: 'No contract record found. Configure and compile the contract first.',
          nodeType: node.type,
        };
      }

      if (contract.status === 'deployed' && contract.deployedAddress) {
        return {
          success: true,
          address: contract.deployedAddress,
          abi: contract.abi,
          txHash: contract.deployedTxHash,
          network: contract.network,
          status: 'deployed',
        };
      }

      if (contract.status === 'compiled') {
        return {
          success: true,
          abi: contract.abi,
          bytecode: contract.bytecode,
          status: 'compiled',
          message: 'Contract compiled but not deployed',
        };
      }

      return {
        success: true,
        status: contract.status,
        message: `Contract is in "${contract.status}" state`,
        compilationErrors: contract.compilationErrors,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const creContractHandler = new CREContractHandler();
