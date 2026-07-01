import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store';
import { SchemaDropdown } from '@/components/SchemaDropdown';
import { addSession } from '@/services/db';
import { Spacing } from '@/constants/theme';

export default function MetadataScreen() {
  const router = useRouter();
  const { pendingImages, setPendingImages } = useAppStore();
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
      
      Alert.alert('Success', 'Session saved to Outbox!', [
        { text: 'OK', onPress: () => {
          setPendingImages([]);
          router.replace('/');
        }}
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save session');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Tag Session</Text>
        
        <ScrollView horizontal style={styles.imageScroll} showsHorizontalScrollIndicator={false}>
          {pendingImages.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.thumbnail} />
          ))}
          {pendingImages.length === 0 && (
            <Text style={styles.noImagesText}>No images selected.</Text>
          )}
        </ScrollView>

        <SchemaDropdown onSelect={(d, m) => {
          setDomainId(d);
          setMocId(m);
        }} />

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.disabledButton]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save to Outbox'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: Spacing.four },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: Spacing.four },
  imageScroll: { marginBottom: Spacing.four, minHeight: 120 },
  thumbnail: { width: 90, height: 120, borderRadius: 8, marginRight: 10, backgroundColor: '#eee' },
  noImagesText: { color: '#999', fontStyle: 'italic', alignSelf: 'center' },
  saveButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  disabledButton: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
