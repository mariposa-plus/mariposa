import { getComponentById } from '@/registry';
import { PipelineNode } from '@/types';

export interface NodeOutput {
  id: string;
  label: string;
  type: string;
  description?: string;
}

/**
 * Get available outputs for a given node based on its component schema
 * @param node The pipeline node to get outputs for
 * @returns Array of available outputs
 */
export function getNodeOutputs(node: PipelineNode): NodeOutput[] {
  if (!node) {
    return [];
  }

  // Try both node.type and node.data.type for compatibility
  const componentType = node.type || node.data?.type;

  if (!componentType) {
    return [];
  }

  // Get the component schema for this node type
  const componentSchema = getComponentById(componentType);

  if (!componentSchema || !componentSchema.outputs) {
    return [];
  }

  // Get static outputs from schema
  const staticOutputs = componentSchema.outputs.map((output) => ({
    id: output.id,
    label: output.label,
    type: output.type,
    description: output.description,
  }));

  return staticOutputs;
}

/**
 * Get all available outputs from multiple upstream nodes
 * @param upstreamNodes Array of upstream nodes
 * @returns Map of node ID to outputs
 */
export function getAllUpstreamOutputs(
  upstreamNodes: PipelineNode[]
): Map<string, NodeOutput[]> {
  const outputsMap = new Map<string, NodeOutput[]>();

  upstreamNodes.forEach((node) => {
    const outputs = getNodeOutputs(node);
    if (outputs.length > 0) {
      outputsMap.set(node.id, outputs);
    }
  });

  return outputsMap;
}

/**
 * Format output field path for display
 * @param outputId The output ID
 * @param outputLabel The output label
 * @returns Formatted field path
 */
export function formatOutputFieldPath(outputId: string, outputLabel: string): string {
  return `${outputId}`;
}

/**
 * Get input fields for a given node
 * @param node The pipeline node to get inputs for
 * @returns Array of available inputs
 */
export function getNodeInputs(node: PipelineNode): NodeOutput[] {
  if (!node) {
    return [];
  }

  // Try both node.type and node.data.type for compatibility
  const componentType = node.type || node.data?.type;

  if (!componentType) {
    return [];
  }

  const componentSchema = getComponentById(componentType);

  if (!componentSchema || !componentSchema.inputs) {
    return [];
  }

  return componentSchema.inputs.map((input) => ({
    id: input.id,
    label: input.label,
    type: input.type,
    description: input.description,
  }));
}
