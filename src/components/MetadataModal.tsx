import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { SchemaDropdown } from '@/components/SchemaDropdown';
import { addSession } from '@/services/db';

export default function MetadataModal() {
  const { pendingImages, setPendingImages, refreshOutbox } = useAppStore();
  const [domainId, setDomainId] = useState('');
  const [mocId, setMocId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!domainId || !mocId) {
      Alert.alert('Incomplete', 'Please select a Domain and MOC.');
      return;
    }
    if (pendingImages.length === 0) {
      Alert.alert('No Images', 'No images were captured.');
      return;
    }

    setIsSaving(true);
    try {
      const sessionId = `${domainId}_${Date.now()}`;
      await addSession({
        sessionId,
        timestamp: new Date().toISOString(),
        domain: domainId,
        mocs: [mocId],
        imagePaths: pendingImages,
        status: 'pending'
      });
      
      await refreshOutbox(); // Automatically updates the store so the Outbox screen sees it immediately
      
      Alert.alert('Success', 'Session saved to Outbox!', [
        { text: 'OK', onPress: () => {
          setPendingImages([]); // This will close the modal
        }}
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save session');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Tagging', 'Are you sure you want to discard these scans?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Discard', style: 'destructive', onPress: () => setPendingImages([]) }
    ]);
  };

  return (
    <Modal visible={pendingImages.length > 0} animationType="slide" presentationStyle="pageSheet">
      {pendingImages.length > 0 && (
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Tag Session</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Scanned Pages</Text>
            <ScrollView horizontal style={styles.imageScroll} showsHorizontalScrollIndicator={false}>
              {pendingImages.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.thumbnail} />
              ))}
              {pendingImages.length === 0 && (
                <Text style={styles.noImagesText}>No images selected.</Text>
              )}
            </ScrollView>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Metadata</Text>
            <SchemaDropdown onSelect={(d, m) => {
              setDomainId(d);
              setMocId(m);
            }} />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.disabledButton]} 
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save to Outbox'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  cancelText: { fontSize: 16, color: '#E11D48', fontWeight: '600' },
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
    borderColor: '#F1F5F9',
    marginBottom: 20
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  imageScroll: { minHeight: 120 },
  thumbnail: { width: 90, height: 120, borderRadius: 12, marginRight: 12, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  noImagesText: { color: '#94A3B8', fontStyle: 'italic', alignSelf: 'center', marginTop: 40 },
  saveButton: { 
    backgroundColor: '#0F172A', 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 12 
  },
  disabledButton: { backgroundColor: '#94A3B8' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});
