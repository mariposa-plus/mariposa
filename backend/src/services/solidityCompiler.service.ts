import CREContract, { ICREContract } from '../models/CREContract';

interface CompilationResult {
  success: boolean;
  abi?: any[];
  bytecode?: string;
  errors?: string[];
  warnings?: string[];
}

class SolidityCompilerService {
  /**
   * Compile Solidity source code
   */
  async compile(soliditySource: string, contractName: string): Promise<CompilationResult> {
    try {
      // Dynamic import solc to avoid issues if not installed yet
      const solc = require('solc');

      const input = {
        language: 'Solidity',
        sources: {
          [`${contractName}.sol`]: {
            content: soliditySource,
          },
        },
        settings: {
          outputSelection: {
            '*': {
              '*': ['abi', 'evm.bytecode.object'],
            },
          },
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      };

      const output = JSON.parse(solc.compile(JSON.stringify(input)));
      const errors: string[] = [];
      const warnings: string[] = [];

      if (output.errors) {
        for (const error of output.errors) {
          if (error.severity === 'error') {
            errors.push(error.formattedMessage || error.message);
          } else {
            warnings.push(error.formattedMessage || error.message);
          }
        }
      }

      if (errors.length > 0) {
        return { success: false, errors, warnings };
      }

      // Find the contract in the output
      const contractOutput = output.contracts?.[`${contractName}.sol`]?.[contractName];
      if (!contractOutput) {
        // Try to find any contract in the output
        const allContracts = output.contracts?.[`${contractName}.sol`];
        const firstContract = allContracts ? Object.values(allContracts)[0] as any : null;
        if (!firstContract) {
          return {
            success: false,
            errors: [`Contract "${contractName}" not found in compilation output`],
            warnings,
          };
        }
        return {
          success: true,
          abi: firstContract.abi,
          bytecode: '0x' + firstContract.evm.bytecode.object,
          warnings,
        };
      }

      return {
        success: true,
        abi: contractOutput.abi,
        bytecode: '0x' + contractOutput.evm.bytecode.object,
        warnings,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [error.message],
      };
    }
  }

  /**
   * Compile a contract from its database record
   */
  async compileForNode(contractId: string): Promise<CompilationResult> {
    const contract = await CREContract.findById(contractId);
    if (!contract) throw new Error('Contract not found');

    contract.status = 'compiling';
    await contract.save();

    const result = await this.compile(contract.soliditySource, contract.contractName);

    if (result.success) {
      contract.status = 'compiled';
      contract.abi = result.abi;
      contract.bytecode = result.bytecode;
      contract.compilationErrors = [];
    } else {
      contract.status = 'failed';
      contract.compilationErrors = result.errors;
    }

    await contract.save();
    return result;
  }

  /**
   * Deploy a compiled contract to a testnet
   */
  async deployToTestnet(
    contractId: string,
    rpcUrl: string,
    privateKeyEnvVar: string,
    constructorArgs: any[] = []
  ): Promise<{ address: string; txHash: string }> {
    const contract = await CREContract.findById(contractId);
    if (!contract) throw new Error('Contract not found');

    if (!contract.abi || !contract.bytecode) {
      // Auto-compile if not compiled yet
      const compileResult = await this.compileForNode(contractId);
      if (!compileResult.success) {
        throw new Error('Compilation failed: ' + (compileResult.errors || []).join(', '));
      }
      // Reload contract after compilation
      await contract.save();
    }

    contract.status = 'deploying';
    await contract.save();

    try {
      const { createWalletClient, createPublicClient, http } = await import('viem');
      const { privateKeyToAccount } = await import('viem/accounts');
      const { sepolia } = await import('viem/chains');

      const privateKey = process.env[privateKeyEnvVar];
      if (!privateKey) {
        throw new Error(`Environment variable ${privateKeyEnvVar} not set`);
      }

      const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}` as `0x${string}`);

      const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(rpcUrl),
      });

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl),
      });

      // Deploy contract
      const txHash = await walletClient.deployContract({
        abi: contract.abi!,
        bytecode: contract.bytecode! as `0x${string}`,
        args: constructorArgs,
      });

      // Wait for receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      contract.status = 'deployed';
      contract.deployedAddress = receipt.contractAddress || undefined;
      contract.deployedTxHash = txHash;
      contract.network = rpcUrl;
      await contract.save();

      return {
        address: receipt.contractAddress || '',
        txHash,
      };
    } catch (error: any) {
      contract.status = 'failed';
      contract.compilationErrors = [error.message];
      await contract.save();
      throw error;
    }
  }
}

export const solidityCompiler = new SolidityCompilerService();
