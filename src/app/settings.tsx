import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { BlurTargetView } from 'expo-blur';
import { useNavigation } from 'expo-router';

import GradientBackground from '@/components/GradientBackground';
import { saveR2Credentials, getR2Credentials, R2Credentials } from '@/services/secureStore';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import { useAppStore } from '@/store';
import { TAB_BAR_HEIGHT } from '@/components/app-tabs';
import { Colors, Fonts, Spacing } from '@/constants/theme';

export default function SettingsScreen() {
  const { setActiveBlurTarget } = useAppStore();
  const [endpoint, setEndpoint] = useState('');
  const [bucket, setBucket] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [pushToken, setPushToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const creds = await getR2Credentials();
    if (creds) {
      setEndpoint(creds.endpoint);
      setBucket(creds.bucket);
      setAccessKey(creds.accessKey);
      setSecretKey(creds.secretKey);
    }

    const token = await registerForPushNotificationsAsync();
    if (token) {
      setPushToken(token);
    }
  };

  const handleSave = async () => {
    if (!endpoint || !bucket || !accessKey || !secretKey) {
      Alert.alert('ERROR', 'Please fill in all R2 credential fields');
      return;
    }

    setIsLoading(true);
    try {
      const creds: R2Credentials = { endpoint, bucket, accessKey, secretKey };
      await saveR2Credentials(creds);
      Alert.alert('SAVED', 'Credentials stored securely.');
    } catch (e) {
      Alert.alert('ERROR', 'Failed to save credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (pushToken) {
      await Clipboard.setStringAsync(pushToken);
      Alert.alert('COPIED', 'Push token copied.');
    }
  };

  return (
    <BlurTargetView ref={localBlurRef} style={{ flex: 1 }}>
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.pageTitle}>SETTINGS</Text>

            {/* R2 Credentials Card */}
            <View style={styles.glassCard}>
              <Text style={styles.cardLabel}>R2 CREDENTIALS</Text>
              <Text style={styles.cardDescription}>
                Cloudflare R2 bucket details. Stored securely on-device.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>ENDPOINT</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://<id>.r2.cloudflarestorage.com"
                  placeholderTextColor={theme.textTertiary}
                  value={endpoint}
                  onChangeText={setEndpoint}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>BUCKET</Text>
                <TextInput
                  style={styles.input}
                  placeholder="akasha-pkm"
                  placeholderTextColor={theme.textTertiary}
                  value={bucket}
                  onChangeText={setBucket}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>ACCESS KEY</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your Access Key ID"
                  placeholderTextColor={theme.textTertiary}
                  value={accessKey}
                  onChangeText={setAccessKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>SECRET KEY</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your Secret Access Key"
                  placeholderTextColor={theme.textTertiary}
                  value={secretKey}
                  onChangeText={setSecretKey}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>{isLoading ? 'SAVING...' : 'SAVE'}</Text>
              </TouchableOpacity>
            </View>

            {/* Push Token Card */}
            <View style={styles.glassCard}>
              <Text style={styles.cardLabel}>PUSH TOKEN</Text>
              <Text style={styles.cardDescription}>
                Used by the desktop agent to notify this device.
              </Text>

              <TouchableOpacity style={styles.tokenBox} onPress={copyToClipboard} activeOpacity={0.7}>
                <Text style={styles.tokenText} numberOfLines={2} ellipsizeMode="middle">
                  {pushToken || 'Fetching...'}
                </Text>
                <Text style={styles.tokenHint}>TAP TO COPY</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </GradientBackground>
    </BlurTargetView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.twoHalf,
    paddingBottom: TAB_BAR_HEIGHT + Spacing.three,
  },
  pageTitle: {
    fontSize: 36,
    fontFamily: Fonts.display,
    color: theme.text,
    letterSpacing: 2,
    marginTop: Spacing.two,
    marginBottom: Spacing.twoHalf,
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
    marginBottom: Spacing.one,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.textTertiary,
    lineHeight: 18,
    fontFamily: Fonts.sans,
    marginBottom: Spacing.twoHalf,
  },
  fieldGroup: {
    marginBottom: Spacing.two,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: Fonts.display,
    color: theme.textSecondary,
    marginBottom: Spacing.half,
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: 10,
    paddingVertical: Spacing.oneHalf,
    paddingHorizontal: Spacing.two,
    fontSize: 14,
    backgroundColor: theme.backgroundElement,
    color: theme.text,
    fontFamily: Fonts.sans,
  },
  saveButton: {
    backgroundColor: theme.primary,
    paddingVertical: Spacing.oneHalf,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: theme.primaryText,
    fontSize: 14,
    fontFamily: Fonts.sansBold,
    letterSpacing: 1,
  },
  tokenBox: {
    backgroundColor: theme.backgroundElement,
    padding: Spacing.two,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  tokenText: {
    fontSize: 12,
    fontFamily: Fonts.mono,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  tokenHint: {
    fontSize: 10,
    fontFamily: Fonts.display,
    color: theme.textTertiary,
    letterSpacing: 1,
    marginTop: Spacing.one,
    textAlign: 'right',
  },
});
