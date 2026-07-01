import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DocumentScanner from 'react-native-document-scanner-plugin';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { SchemaDropdown } from '@/components/SchemaDropdown';
import { addSession, getPendingSessions } from '@/services/db';
import { useAppStore } from '@/store';

export default function HomeScreen() {
  const router = useRouter();
  const { setPendingImages } = useAppStore();

  const handleCameraCapture = async () => {
    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        croppedImageQuality: 100,
        maxNumDocuments: 10,
      });
      if (scannedImages && scannedImages.length > 0) {
        setPendingImages(scannedImages);
        router.push('/metadata');
      }
    } catch (e: any) {
      Alert.alert('Scanner Error', e.message);
    }
  };

  const handleGalleryImport = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map(a => a.uri);
        setPendingImages(uris);
        router.push('/metadata');
      }
    } catch (e: any) {
      Alert.alert('Picker Error', e.message);
    }
  };

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
          <ThemedText type="title">Akasha Link</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Capture Documents</ThemedText>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCameraCapture}>
            <Text style={styles.primaryButtonText}>📸 New Camera Capture</Text>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Sprint 2 Debug</ThemedText>
          <SchemaDropdown />
          <TouchableOpacity style={styles.secondaryButton} onPress={testDb}>
            <Text style={styles.secondaryButtonText}>Insert SQLite Test Session</Text>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: Spacing.four, gap: Spacing.four },
  header: { marginBottom: Spacing.three },
  section: { padding: Spacing.three, backgroundColor: '#f9f9f9', borderRadius: Spacing.three, marginBottom: Spacing.three },
  sectionTitle: { marginBottom: Spacing.three },
  primaryButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#e0e0e0', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  secondaryButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' }
});
