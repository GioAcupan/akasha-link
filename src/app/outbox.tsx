import React, { useEffect, useState, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { BlurTargetView } from 'expo-blur';
import { useNavigation } from 'expo-router';

import { registerForPushNotificationsAsync } from '@/services/notifications';
import { useAppStore } from '@/store';
import { SyncManager } from '@/services/syncManager';
import { SessionQueueItem } from '@/services/db';
import { CloudUpload, Copy } from 'lucide-react-native';
import GradientBackground from '@/components/GradientBackground';
import { TAB_BAR_HEIGHT } from '@/components/app-tabs';
import { Colors, Fonts, Spacing } from '@/constants/theme';

export default function OutboxScreen() {
  const { isSyncing, outboxItems, refreshOutbox, setActiveBlurTarget } = useAppStore();
  const [pushToken, setPushToken] = useState<string>('');
  
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const localBlurRef = useRef<View>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setActiveBlurTarget(localBlurRef);
    });
    if (navigation.isFocused()) {
      setActiveBlurTarget(localBlurRef);
    }
    return unsubscribe;
  }, [navigation, setActiveBlurTarget]);

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
    Alert.alert('COPIED', 'Push token copied.');
  };

  const renderItem = ({ item }: { item: SessionQueueItem }) => {
    let statusColor: string = theme.textSecondary;
    let statusBg: string = 'transparent';
    
    if (item.status === 'completed') { statusColor = theme.success; statusBg = theme.successBg; }
    if (item.status === 'failed') { statusColor = theme.danger; statusBg = 'rgba(255,0,51,0.12)'; }
    if (item.status === 'uploading') { statusColor = theme.warning; statusBg = theme.warningBg; }
    if (item.status === 'pending') { statusColor = theme.textSecondary; statusBg = theme.backgroundElement; }

    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionDomain} numberOfLines={1}>{item.domain}</Text>
          <View style={[styles.badge, { backgroundColor: statusBg }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.sessionMoc}>{item.mocs.join(' \u00b7 ')}</Text>
        <Text style={styles.sessionTime}>{new Date(item.timestamp).toLocaleString()}</Text>
        {item.error && <Text style={styles.sessionError}>{item.error}</Text>}
      </View>
    );
  };

  return (
    <BlurTargetView ref={localBlurRef} style={{ flex: 1 }}>
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerArea}>
            <Text style={styles.pageTitle}>OUTBOX</Text>
            
            <TouchableOpacity style={styles.tokenRow} onPress={copyToken} activeOpacity={0.7}>
              <Text style={styles.tokenValue} numberOfLines={1} ellipsizeMode="middle">{pushToken || '...'}</Text>
              <Copy color={theme.textTertiary} size={14} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={outboxItems}
            keyExtractor={item => item.sessionId}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.emptyText}>NO SESSIONS IN OUTBOX.</Text>}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]} 
              onPress={handleSync}
              disabled={isSyncing}
              activeOpacity={0.7}
            >
              <CloudUpload color={theme.primaryText} size={18} style={{ marginRight: Spacing.one }} strokeWidth={2.5} />
              <Text style={styles.syncBtnText}>
                {isSyncing ? 'SYNCING...' : 'SYNC ALL'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </GradientBackground>
    </BlurTargetView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  safeArea: { flex: 1 },
  headerArea: { paddingHorizontal: Spacing.twoHalf, marginTop: Spacing.two },
  pageTitle: { 
    fontSize: 36, 
    fontFamily: Fonts.display, 
    color: theme.text, 
    letterSpacing: 2, 
    marginBottom: Spacing.oneHalf,
  },
  tokenRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.one,
    backgroundColor: theme.glass,
    borderRadius: 8,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.oneHalf,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    marginBottom: Spacing.two,
  },
  tokenValue: { 
    fontSize: 11, 
    color: theme.textTertiary, 
    fontFamily: Fonts.mono, 
    flex: 1,
  },
  list: { paddingHorizontal: Spacing.twoHalf, paddingBottom: TAB_BAR_HEIGHT + 60 },
  sessionCard: { 
    backgroundColor: theme.glass, 
    borderRadius: 16, 
    padding: Spacing.two, 
    marginBottom: Spacing.oneHalf,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  sessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.half },
  sessionDomain: { fontSize: 14, fontFamily: Fonts.sansBold, color: theme.text, flex: 1, marginRight: Spacing.one },
  badge: { paddingHorizontal: Spacing.one, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontFamily: Fonts.display, letterSpacing: 1 },
  sessionMoc: { fontSize: 12, color: theme.textSecondary, fontFamily: Fonts.sans, marginBottom: Spacing.half },
  sessionTime: { fontSize: 11, color: theme.textTertiary, fontFamily: Fonts.sans },
  sessionError: { 
    fontSize: 12, 
    color: theme.danger, 
    marginTop: Spacing.one, 
    fontFamily: Fonts.sans, 
  },
  emptyText: { textAlign: 'center', color: theme.textTertiary, marginTop: Spacing.five, fontSize: 13, fontFamily: Fonts.display, letterSpacing: 2 },
  footer: { 
    paddingHorizontal: Spacing.twoHalf, 
    paddingTop: Spacing.oneHalf,
    paddingBottom: TAB_BAR_HEIGHT + Spacing.one,
  },
  syncBtn: {
    backgroundColor: theme.primary, 
    paddingVertical: Spacing.oneHalf, 
    borderRadius: 12, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  syncBtnDisabled: { opacity: 0.4 },
  syncBtnText: { color: theme.primaryText, fontSize: 14, fontFamily: Fonts.sansBold, letterSpacing: 1 },
});
