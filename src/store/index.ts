import { create } from 'zustand';
import { fetchSchema } from '../services/r2';

export interface AkashaSchema {
  domains?: any[];
  mocs?: any[];
  [key: string]: any;
}

interface AppState {
  schema: AkashaSchema | null;
  isSchemaLoading: boolean;
  schemaError: string | null;
  pendingImages: string[];
  loadSchema: () => Promise<void>;
  setPendingImages: (images: string[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  schema: null,
  isSchemaLoading: false,
  schemaError: null,
  pendingImages: [],
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
  setPendingImages: (images: string[]) => set({ pendingImages: images }),
}));
