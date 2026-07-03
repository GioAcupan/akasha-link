import React, { useMemo, useRef, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { Camera, Trash2 } from 'lucide-react-native';
import { BlurTargetView } from 'expo-blur';
import { useNavigation } from 'expo-router';

import GradientBackground from '@/components/GradientBackground';
import { SchemaDropdown } from '@/components/SchemaDropdown';
import MetadataModal from '@/components/MetadataModal';
import { clearAllSessions } from '@/services/db';
import { useAppStore } from '@/store';
import { TAB_BAR_HEIGHT } from '@/components/app-tabs';
import { Colors, Fonts, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const { setPendingImages, setActiveBlurTarget } = useAppStore();
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
      } else {
        Alert.alert('No images', 'The scanner did not return any images. ' + JSON.stringify(response));
      }
    } catch (e: any) {
      Alert.alert('Scanner Error', e.message);
    }
  };

  const handleClearDb = async () => {
    Alert.alert('CLEAR DATABASE', 'Remove all sessions from the outbox?', [
      { text: 'CANCEL', style: 'cancel' },
      { text: 'CLEAR', style: 'destructive', onPress: async () => {
        try {
          await clearAllSessions();
          Alert.alert('CLEARED', 'All sessions removed.');
        } catch (e: any) {
          Alert.alert('ERROR', e.message);
        }
      }},
    ]);
  };

  return (
    <BlurTargetView ref={localBlurRef} style={{ flex: 1 }}>
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.titleText}>AKASHA</Text>
              <Text style={styles.subtitleText}>CAPTURE_SYNC</Text>
            </View>

            {/* Scan Card */}
            <View style={styles.glassCard}>
              <Text style={styles.cardLabel}>NEW SESSION</Text>
              <TouchableOpacity style={styles.scanButton} onPress={handleCameraCapture} activeOpacity={0.7}>
                <Camera color={theme.primaryText} size={20} style={styles.btnIcon} strokeWidth={2.5} />
                <Text style={styles.scanButtonText}>SCAN DOCUMENTS</Text>
              </TouchableOpacity>
            </View>

            {/* Schema Card */}
            <View style={styles.glassCard}>
              <Text style={styles.cardLabel}>SCHEMA</Text>
              <SchemaDropdown />
            </View>

            {/* Danger Zone */}
            <TouchableOpacity style={styles.dangerRow} onPress={handleClearDb} activeOpacity={0.7}>
              <Trash2 color={theme.danger} size={16} strokeWidth={2.5} />
              <Text style={styles.dangerRowText}>CLEAR DATABASE</Text>
            </TouchableOpacity>
          </ScrollView>
          <MetadataModal />
        </SafeAreaView>
      </GradientBackground>
    </BlurTargetView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingHorizontal: Spacing.twoHalf, paddingBottom: TAB_BAR_HEIGHT + Spacing.three },
  header: { marginTop: Spacing.two, marginBottom: Spacing.twoHalf },
  titleText: { 
    fontSize: 36, 
    fontFamily: Fonts.display, 
    color: theme.text, 
    letterSpacing: 2,
  },
  subtitleText: { 
    fontSize: 12, 
    fontFamily: Fonts.display,
    color: theme.danger, 
    marginTop: Spacing.half,
    letterSpacing: 3,
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
  scanButton: { 
    backgroundColor: theme.primary, 
    paddingVertical: Spacing.oneHalf, 
    paddingHorizontal: Spacing.three,
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  scanButtonText: { 
    color: theme.primaryText, 
    fontSize: 14, 
    fontFamily: Fonts.sansBold,
    letterSpacing: 1,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    marginTop: Spacing.two,
    opacity: 0.65,
  },
  dangerRowText: { 
    color: theme.danger, 
    fontSize: 14, 
    fontFamily: Fonts.display,
    letterSpacing: 1.5,
  },
  btnIcon: { marginRight: Spacing.one },
});
