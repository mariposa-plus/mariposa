import { create } from 'zustand';
import { api } from '@/lib/api';
import { Pipeline, PipelineNode, PipelineEdge } from '@/types';

interface PipelineSummary {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  lastExecutedAt?: string;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PipelinesState {
  pipelines: PipelineSummary[];
  currentPipeline: Pipeline | null;
  isLoading: boolean;
  error: string | null;

  fetchPipelines: () => Promise<void>;
  fetchPipeline: (id: string) => Promise<void>;
  createPipeline: (name: string, description?: string) => Promise<string>;
  updatePipeline: (id: string, data: Partial<Pipeline>) => Promise<void>;
  deletePipeline: (id: string) => Promise<void>;
  duplicatePipeline: (id: string) => Promise<void>;
  updateNodes: (nodes: PipelineNode[]) => void;
  updateEdges: (edges: PipelineEdge[]) => void;
  savePipeline: () => Promise<void>;
  clearError: () => void;
}

export const usePipelinesStore = create<PipelinesState>((set, get) => ({
  pipelines: [],
  currentPipeline: null,
  isLoading: false,
  error: null,

  fetchPipelines: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/pipelines');
      set({ pipelines: data.data || [], isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to fetch pipelines'
      });
    }
  },

  fetchPipeline: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/pipelines/${id}`);
      set({ currentPipeline: data.data, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to fetch pipeline'
      });
    }
  },

  createPipeline: async (name: string, description?: string) => {
    try {
      const { data } = await api.post('/pipelines', { name, description });
      set({ pipelines: [data.data, ...get().pipelines] });
      return data.data._id;
    } catch (err: any) {
      const error = err.response?.data?.message || 'Failed to create pipeline';
      set({ error });
      throw new Error(error);
    }
  },

  updatePipeline: async (id: string, updates: Partial<Pipeline>) => {
    try {
      const { data } = await api.put(`/pipelines/${id}`, updates);
      set({ currentPipeline: data.data });
      // Update in list too
      set({
        pipelines: get().pipelines.map((p) =>
          p._id === id ? { ...p, ...updates } : p
        ),
      });
    } catch (err: any) {
      const error = err.response?.data?.message || 'Failed to update pipeline';
      set({ error });
      throw new Error(error);
    }
  },

  deletePipeline: async (id: string) => {
    try {
      await api.delete(`/pipelines/${id}`);
      set({ pipelines: get().pipelines.filter((p) => p._id !== id) });
    } catch (err: any) {
      const error = err.response?.data?.message || 'Failed to delete pipeline';
      set({ error });
      throw new Error(error);
    }
  },

  duplicatePipeline: async (id: string) => {
    try {
      const { data } = await api.post(`/pipelines/${id}/duplicate`);
      set({ pipelines: [data.data, ...get().pipelines] });
    } catch (err: any) {
      const error = err.response?.data?.message || 'Failed to duplicate pipeline';
      set({ error });
      throw new Error(error);
    }
  },

  updateNodes: (nodes: PipelineNode[]) => {
    const current = get().currentPipeline;
    if (current) {
      set({ currentPipeline: { ...current, nodes } });
    }
  },

  updateEdges: (edges: PipelineEdge[]) => {
    const current = get().currentPipeline;
    if (current) {
      set({ currentPipeline: { ...current, edges } });
    }
  },

  savePipeline: async () => {
    const current = get().currentPipeline;
    if (!current) return;

    try {
      await get().updatePipeline(current._id, {
        nodes: current.nodes,
        edges: current.edges,
      });
    } catch (err: any) {
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
