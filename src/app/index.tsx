import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { Camera, Database, Trash2 } from 'lucide-react-native';

import { SchemaDropdown } from '@/components/SchemaDropdown';
import MetadataModal from '@/components/MetadataModal';
import { addSession, getPendingSessions, clearAllSessions } from '@/services/db';
import { useAppStore } from '@/store';

export default function HomeScreen() {
  const router = useRouter();
  const { setPendingImages } = useAppStore();

  const handleCameraCapture = async () => {
    try {
      const response = await DocumentScanner.scanDocument({
        croppedImageQuality: 100,
        maxNumDocuments: 10,
      });
      
      if (response.status === 'cancel') {
        Alert.alert('Scanner Cancelled', 'The scanner returned status: cancel. Did you hit the back button instead of save?');
        return;
      }

      if (response.scannedImages && response.scannedImages.length > 0) {
        setPendingImages(response.scannedImages);
        // The MetadataModal will automatically appear because pendingImages.length > 0
      } else {
        Alert.alert('No images', 'The scanner did not return any images. ' + JSON.stringify(response));
      }
    } catch (e: any) {
      Alert.alert('Scanner Error', e.message);
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

  const handleClearDb = async () => {
    try {
      await clearAllSessions();
      Alert.alert('Database Cleared', 'All sessions have been removed.');
    } catch (e: any) {
      Alert.alert('Clear DB Error', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Akasha</Text>
          <Text style={styles.subtitleText}>Capture & Sync</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>New Session</Text>
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleCameraCapture} activeOpacity={0.8}>
            <Camera color="#fff" size={24} style={styles.btnIcon} />
            <Text style={styles.primaryButtonText}>Scan Documents</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Developer Tools</Text>
          <SchemaDropdown />
          <TouchableOpacity style={styles.tertiaryButton} onPress={testDb} activeOpacity={0.8}>
            <Database color="#475569" size={20} style={styles.btnIcon} />
            <Text style={styles.tertiaryButtonText}>Insert Test Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerButton} onPress={handleClearDb} activeOpacity={0.8}>
            <Trash2 color="#E11D48" size={20} style={styles.btnIcon} />
            <Text style={styles.dangerButtonText}>Clear Outbox DB</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <MetadataModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 24, gap: 24 },
  header: { marginTop: 12, marginBottom: 8 },
  titleText: { fontSize: 32, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  subtitleText: { fontSize: 16, color: '#64748B', marginTop: 4, fontWeight: '500' },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 20 },
  primaryButton: { 
    backgroundColor: '#0F172A', 
    padding: 18, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  tertiaryButton: { 
    backgroundColor: '#F1F5F9', 
    padding: 16, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 16 
  },
  tertiaryButtonText: { color: '#475569', fontSize: 15, fontWeight: '600' },
  dangerButton: { 
    backgroundColor: '#FFE4E6', 
    padding: 16, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 12 
  },
  dangerButtonText: { color: '#E11D48', fontSize: 15, fontWeight: '600' },
  btnIcon: { marginRight: 12 },
});
