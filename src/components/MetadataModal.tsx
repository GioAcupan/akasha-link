import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text, Alert, Modal, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { SchemaDropdown } from '@/components/SchemaDropdown';
import { addSession } from '@/services/db';
import { Colors, Fonts, Spacing } from '@/constants/theme';

export default function MetadataModal() {
  const { pendingImages, setPendingImages, refreshOutbox } = useAppStore();
  const [domainId, setDomainId] = useState('');
  const [mocId, setMocId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSave = async () => {
    if (!domainId || !mocId) {
      Alert.alert('INCOMPLETE', 'Please select a Domain and MOC.');
      return;
    }
    if (pendingImages.length === 0) {
      Alert.alert('NO IMAGES', 'No images were captured.');
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
      
      await refreshOutbox();
      
      Alert.alert('SAVED', 'Session added to Outbox.', [
        { text: 'OK', onPress: () => setPendingImages([]) }
      ]);
    } catch (e: any) {
      Alert.alert('ERROR', e.message || 'Failed to save session');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('DISCARD', 'Discard these scans?', [
      { text: 'KEEP', style: 'cancel' },
      { text: 'DISCARD', style: 'destructive', onPress: () => setPendingImages([]) }
    ]);
  };

  return (
    <Modal visible={pendingImages.length > 0} animationType="slide" presentationStyle="pageSheet">
      {pendingImages.length > 0 && (
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>TAG</Text>
              <TouchableOpacity onPress={handleCancel} activeOpacity={0.7}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
            
            {/* Thumbnails */}
            <View style={styles.glassCard}>
              <Text style={styles.cardLabel}>SCANNED · {pendingImages.length}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {pendingImages.map((uri, idx) => (
                  <Image key={idx} source={{ uri }} style={styles.thumbnail} />
                ))}
              </ScrollView>
            </View>

            {/* Schema */}
            <View style={styles.glassCard}>
              <Text style={styles.cardLabel}>METADATA</Text>
              <SchemaDropdown onSelect={(d, m) => {
                setDomainId(d);
                setMocId(m);
              }} />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, isSaving && styles.disabledButton]} 
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>{isSaving ? 'SAVING...' : 'SAVE TO OUTBOX'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      )}
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { paddingHorizontal: Spacing.twoHalf, paddingBottom: Spacing.five },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  title: { 
    fontSize: 36, 
    fontFamily: Fonts.display, 
    color: theme.text, 
    letterSpacing: 2,
  },
  cancelText: { 
    fontSize: 13, 
    fontFamily: Fonts.sansBold, 
    color: theme.danger,
    letterSpacing: 1,
  },
  glassCard: { 
    backgroundColor: theme.glass, 
    borderRadius: 20, 
    padding: Spacing.twoHalf,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    marginBottom: Spacing.two,
  },
  cardLabel: { 
    fontSize: 11, 
    fontFamily: Fonts.display, 
    color: theme.textSecondary,
    letterSpacing: 2,
    marginBottom: Spacing.two,
  },
  thumbnail: { 
    width: 72, 
    height: 96, 
    borderRadius: 8, 
    marginRight: Spacing.one, 
    backgroundColor: theme.backgroundElement, 
    borderWidth: 1, 
    borderColor: theme.glassBorder,
  },
  saveButton: { 
    backgroundColor: theme.primary, 
    paddingVertical: Spacing.oneHalf, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: Spacing.one,
  },
  disabledButton: { opacity: 0.4 },
  saveButtonText: { 
    color: theme.primaryText, 
    fontSize: 14, 
    fontFamily: Fonts.sansBold,
    letterSpacing: 1,
  }
});
