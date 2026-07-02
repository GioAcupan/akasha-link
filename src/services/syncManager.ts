import { getPendingSessions, updateSessionStatus, SessionQueueItem, getDb } from './db';
import { uploadImage, uploadManifest } from './r2';
import * as FileSystem from 'expo-file-system';
import { useAppStore } from '../store';

export class SyncManager {
  static async sync() {
    const store = useAppStore.getState();
    if (store.isSyncing) return;

    store.setSyncing(true);
    
    try {
      const pending = await getPendingSessions();
      for (const session of pending) {
        if (session.status === 'completed') continue;
        
        await updateSessionStatus(session.sessionId, 'uploading');
        
        try {
          // Step 1: Upload all images concurrently
          const uploadPromises = session.imagePaths.map((uri, index) => {
            const ext = uri.split('.').pop() || 'jpg';
            const key = `images/${session.sessionId}_page${index + 1}.${ext}`;
            return uploadImage(uri, key);
          });
          
          await Promise.all(uploadPromises);
          
          // Step 2: Upload manifest
          const manifestKey = `manifests/${session.sessionId}.json`;
          const manifest = {
            session_id: session.sessionId,
            timestamp: session.timestamp,
            images: session.imagePaths.map((uri, index) => {
              const ext = uri.split('.').pop() || 'jpg';
              return `${session.sessionId}_page${index + 1}.${ext}`;
            }),
            domain: session.domain,
            mocs: session.mocs,
          };
          
          await uploadManifest(manifestKey, manifest);
          
          // Cleanup local images
          for (const uri of session.imagePaths) {
            try {
              await FileSystem.deleteAsync(uri, { idempotent: true });
            } catch (e) {
              console.log('Failed to delete local image', e);
            }
          }
          
          await updateSessionStatus(session.sessionId, 'completed');
        } catch (error: any) {
          console.error(`Sync error for session ${session.sessionId}:`, error);
          await updateSessionStatus(session.sessionId, 'failed', error.message || 'Unknown error');
        }
      }
    } finally {
      store.setSyncing(false);
      // Trigger outbox refresh
      store.refreshOutbox();
    }
  }
}
