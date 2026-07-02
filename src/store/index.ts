import { create } from 'zustand';
import { fetchSchema } from '../services/r2';
import { getPendingSessions, SessionQueueItem } from '../services/db';

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
  isSyncing: boolean;
  outboxItems: SessionQueueItem[];
  loadSchema: () => Promise<void>;
  useMockSchema: () => void;
  setPendingImages: (images: string[]) => void;
  setSyncing: (syncing: boolean) => void;
  refreshOutbox: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  schema: null,
  isSchemaLoading: false,
  schemaError: null,
  pendingImages: [],
  isSyncing: false,
  outboxItems: [],
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
  useMockSchema: () => {
    set({
      schemaError: null,
      schema: {
        domains: [
          { id: 'work', label: 'Work', mocs: [{ id: 'meeting-notes', label: 'Meeting Notes' }, { id: 'receipts', label: 'Receipts' }] },
          { id: 'personal', label: 'Personal', mocs: [{ id: 'journal', label: 'Journal' }, { id: 'health', label: 'Health' }] }
        ]
      }
    });
  },
  setPendingImages: (images: string[]) => set({ pendingImages: images }),
  setSyncing: (syncing: boolean) => set({ isSyncing: syncing }),
  refreshOutbox: async () => {
    const items = await getPendingSessions();
    set({ outboxItems: items });
  }
}));
