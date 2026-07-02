import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import { useAppStore } from '@/store';
import { SyncManager } from '@/services/syncManager';
import { SessionQueueItem } from '@/services/db';
import { CloudUpload, Copy } from 'lucide-react-native';

export default function OutboxScreen() {
  const { isSyncing, outboxItems, refreshOutbox } = useAppStore();
  const [pushToken, setPushToken] = useState<string>('');

  useEffect(() => {
    refreshOutbox();
    registerForPushNotificationsAsync().then(token => setPushToken(token || ''));
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;
    await SyncManager.sync();
  };

  const copyToken = async () => {
    await Clipboard.setStringAsync(pushToken);
    Alert.alert('Copied!', 'Push token copied to clipboard.');
  };

  const renderItem = ({ item }: { item: SessionQueueItem }) => {
    let statusColor = '#0F172A';
    let bgColor = '#F1F5F9';
    if (item.status === 'completed') { statusColor = '#059669'; bgColor = '#D1FAE5'; }
    if (item.status === 'failed') { statusColor = '#E11D48'; bgColor = '#FFE4E6'; }
    if (item.status === 'uploading') { statusColor = '#D97706'; bgColor = '#FEF3C7'; }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.domain} / {item.mocs.join(', ')}</Text>
          <View style={[styles.badge, { backgroundColor: bgColor }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.cardTime}>{new Date(item.timestamp).toLocaleString()}</Text>
        <Text style={styles.cardId}>{item.sessionId}</Text>
        {item.error && <Text style={styles.cardError}>{item.error}</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Outbox</Text>

        <TouchableOpacity style={styles.tokenBox} onPress={copyToken} activeOpacity={0.7}>
          <View style={styles.tokenBoxInner}>
            <View style={styles.tokenHeader}>
              <Text style={styles.tokenLabel}>Push Token</Text>
              <Copy color="#64748B" size={16} />
            </View>
            <Text style={styles.tokenText} numberOfLines={1} ellipsizeMode="middle">{pushToken || 'Fetching...'}</Text>
          </View>
        </TouchableOpacity>

        <FlatList
          data={outboxItems}
          keyExtractor={item => item.sessionId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No sessions in outbox.</Text>}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]} 
          onPress={handleSync}
          disabled={isSyncing}
          activeOpacity={0.8}
        >
          <CloudUpload color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.syncBtnText}>
            {isSyncing ? 'SYNCING...' : 'SYNC ALL NOW'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  header: { fontSize: 32, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5, marginBottom: 24 },
  tokenBox: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tokenBoxInner: { padding: 16 },
  tokenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tokenLabel: { fontSize: 14, color: '#0F172A', fontWeight: '600' },
  tokenText: { fontSize: 12, color: '#64748B', fontFamily: 'monospace' },
  list: { paddingBottom: 100 },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  cardTime: { fontSize: 13, color: '#64748B', marginBottom: 4, fontWeight: '500' },
  cardId: { fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' },
  cardError: { fontSize: 13, color: '#E11D48', marginTop: 8, fontWeight: '500', backgroundColor: '#FFE4E6', padding: 8, borderRadius: 6 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 40, fontSize: 15 },
  footer: { 
    padding: 24, 
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  syncBtn: {
    backgroundColor: '#0F172A', 
    padding: 18, 
    borderRadius: 16, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  syncBtnDisabled: { backgroundColor: '#94A3B8' },
  syncBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
