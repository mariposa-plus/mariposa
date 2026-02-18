import { create } from 'zustand';
import { api } from '@/lib/api';

interface CREState {
  error: string | null;

  // Workflow generation
  generatedCode: string | null;
  isGenerating: boolean;
  generateWarnings: string[];
  generateWorkflow: (pipelineId: string) => Promise<void>;
}

export const useCREStore = create<CREState>((set) => ({
  error: null,
  generatedCode: null,
  isGenerating: false,
  generateWarnings: [],

  generateWorkflow: async (pipelineId: string) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await api.post('/cre/workflows/generate', { pipelineId });
      const workflow = response.data.workflow;
      set({
        generatedCode: workflow.generatedCode,
        generateWarnings: workflow.validationErrors || [],
        isGenerating: false,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, isGenerating: false });
      throw error;
    }
  },
}));
