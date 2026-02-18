import vm from 'vm';

interface NodeConfig {
  type: string;
  data: {
    config?: Record<string, any>;
    fullConfig?: {
      component: Record<string, any>;
    };
  };
}

class CRELogicHandler {
  async execute(node: NodeConfig, execution: any, inputs: Record<string, any>): Promise<any> {
    const config = node.data?.fullConfig?.component || node.data?.config || {};

    switch (node.type) {
      case 'data-transform':
        return this.executeDataTransform(config, inputs);
      case 'condition':
        return this.executeCondition(config, inputs);
      case 'abi-encode':
        return this.executeAbiEncode(config, inputs);
      case 'abi-decode':
        return this.executeAbiDecode(config, inputs);
      case 'consensus-aggregation':
        return this.executeConsensusAggregation(config, inputs);
      default:
        return { success: true, nodeType: node.type };
    }
  }

  private executeDataTransform(config: any, inputs: any): any {
    try {
      const expression = config.transformExpression;
      if (!expression) {
        return { success: false, error: 'No transform expression provided' };
      }

      const sandbox = { data: inputs, result: null as any };
      const script = new vm.Script(`result = (function() { ${expression} })()`);
      const context = vm.createContext(sandbox);
      script.runInContext(context, { timeout: 5000 });

      return {
        success: true,
        transformed: sandbox.result,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private executeCondition(config: any, inputs: any): any {
    try {
      const expression = config.expression;
      if (!expression) {
        return { success: true, result: true };
      }

      const sandbox = { data: inputs, result: false };
      const script = new vm.Script(`result = (function() { ${expression} })()`);
      const context = vm.createContext(sandbox);
      script.runInContext(context, { timeout: 5000 });

      return {
        success: true,
        result: !!sandbox.result,
        branch: sandbox.result ? config.trueLabel || 'true' : config.falseLabel || 'false',
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async executeAbiEncode(config: any, inputs: any): Promise<any> {
    try {
      const { encodeAbiParameters, parseAbiParameters } = await import('viem');
      const types = config.types || 'uint256';
      const values = inputs.dynamicValues || config.values || [0];

      const encoded = encodeAbiParameters(
        parseAbiParameters(types) as any,
        values
      );

      return { success: true, encoded };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async executeAbiDecode(config: any, inputs: any): Promise<any> {
    try {
      const { decodeAbiParameters, parseAbiParameters } = await import('viem');
      const types = config.types || 'uint256';
      const data = inputs.data || config.encodedData;

      if (!data) {
        return { success: false, error: 'No encoded data provided' };
      }

      const decoded = decodeAbiParameters(
        parseAbiParameters(types) as any,
        data as `0x${string}`
      );

      return { success: true, decoded: Array.from(decoded) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private executeConsensusAggregation(config: any, inputs: any): any {
    const method = config.aggregationMethod || 'median';
    const values = Array.isArray(inputs.values) ? inputs.values : [];

    if (values.length === 0) {
      return { success: true, aggregatedValue: null, reportCount: 0 };
    }

    let aggregatedValue: number;
    const numericValues = values.map(Number).filter((v: number) => !isNaN(v));

    switch (method) {
      case 'median': {
        const sorted = [...numericValues].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        aggregatedValue = sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;
        break;
      }
      case 'mean':
        aggregatedValue = numericValues.reduce((a: number, b: number) => a + b, 0) / numericValues.length;
        break;
      case 'mode': {
        const freq = new Map<number, number>();
        for (const v of numericValues) {
          freq.set(v, (freq.get(v) || 0) + 1);
        }
        let maxFreq = 0;
        aggregatedValue = numericValues[0];
        for (const [val, count] of freq) {
          if (count > maxFreq) {
            maxFreq = count;
            aggregatedValue = val;
          }
        }
        break;
      }
      default:
        aggregatedValue = numericValues[0];
    }

    return {
      success: true,
      aggregatedValue,
      reportCount: numericValues.length,
    };
  }
}

export const creLogicHandler = new CRELogicHandler();
