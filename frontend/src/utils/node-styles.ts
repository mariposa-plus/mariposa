import { NodeState } from '@/types';

export interface NodeStyleConfig {
  border: string;
  background: string;
  badgeColor?: string;
  badgeText?: string;
}

export const STATE_STYLES: Record<NodeState, NodeStyleConfig> = {
  draft: {
    border: '2px dashed #888',
    background: '#1a1a2e',
    badgeColor: '#6b7280',
    badgeText: 'Draft',
  },
  configured: {
    border: '2px solid #fbbf24',
    background: '#1a1a2e',
    badgeColor: '#fbbf24',
    badgeText: 'Configured',
  },
  ready: {
    border: '2px solid #10b981',
    background: '#1a1a2e',
    badgeColor: '#10b981',
    badgeText: 'Ready',
  },
  error: {
    border: '2px solid #ef4444',
    background: '#1a1a2e',
    badgeColor: '#ef4444',
    badgeText: 'Error',
  },
};

export function getNodeStyle(state?: NodeState): NodeStyleConfig {
  return state ? STATE_STYLES[state] : { border: '2px solid #888', background: '#1a1a2e' };
}
