import { create } from 'zustand';
import { fetchSchema } from '../services/r2';

export interface AkashaSchema {
  domains?: string[];
  mocs?: string[];
  [key: string]: any;
}

interface AppState {
  schema: AkashaSchema | null;
  isSchemaLoading: boolean;
  schemaError: string | null;
  loadSchema: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  schema: null,
  isSchemaLoading: false,
  schemaError: null,
  loadSchema: async () => {
    set({ isSchemaLoading: true, schemaError: null });
    try {
      const data = await fetchSchema();
      set({ schema: data, isSchemaLoading: false });
    } catch (error: any) {
      set({ 
        schemaError: error.message || 'Failed to load schema', 
        isSchemaLoading: false 
      });
    }
  },
}));
