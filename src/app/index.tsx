import React from 'react';
import { StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { SchemaDropdown } from '@/components/SchemaDropdown';
import { addSession, getPendingSessions } from '@/services/db';

export default function HomeScreen() {
  const testDb = async () => {
    try {
      const sessionId = `test_${Date.now()}`;
      await addSession({
        sessionId,
        timestamp: new Date().toISOString(),
        domain: 'test-domain',
        mocs: ['test-moc'],
        imagePaths: ['file:///test.jpg'],
        status: 'pending'
      });
      const sessions = await getPendingSessions();
      Alert.alert('DB Test Success', `Pending sessions: ${sessions.length}\nLast ID: ${sessions[sessions.length - 1]?.sessionId}`);
    } catch (e: any) {
      Alert.alert('DB Test Error', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Sprint 2 Debug</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Schema & R2 Fetch</ThemedText>
          <SchemaDropdown />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">SQLite Test</ThemedText>
          <Button title="Insert Test Session & Count" onPress={testDb} />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    marginBottom: Spacing.three,
  },
  section: {
    padding: Spacing.three,
    backgroundColor: '#f9f9f9',
    borderRadius: Spacing.three,
    marginBottom: Spacing.three,
  }
});
