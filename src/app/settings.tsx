import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { saveR2Credentials, getR2Credentials, R2Credentials } from '@/services/secureStore';
import { registerForPushNotificationsAsync } from '@/services/notifications';

export default function SettingsScreen() {
  const [endpoint, setEndpoint] = useState('');
  const [bucket, setBucket] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [pushToken, setPushToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      Alert.alert('Error', 'Please fill in all R2 credential fields');
      return;
    }

    setIsLoading(true);
    try {
      const creds: R2Credentials = { endpoint, bucket, accessKey, secretKey };
      await saveR2Credentials(creds);
      Alert.alert('Success', 'Credentials saved successfully!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (pushToken) {
      await Clipboard.setStringAsync(pushToken);
      Alert.alert('Copied', 'Push token copied to clipboard. Paste this into your desktop .env file.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>R2 Credentials</Text>
      <Text style={styles.description}>
        Enter your Cloudflare R2 bucket details. These are stored securely on your device.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Endpoint URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://<account_id>.r2.cloudflarestorage.com"
          placeholderTextColor="#999"
          value={endpoint}
          onChangeText={setEndpoint}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bucket Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. akasha-pkm"
          placeholderTextColor="#999"
          value={bucket}
          onChangeText={setBucket}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Access Key ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Access Key"
          placeholderTextColor="#999"
          value={accessKey}
          onChangeText={setAccessKey}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Secret Access Key</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Secret Key"
          placeholderTextColor="#999"
          value={secretKey}
          onChangeText={setSecretKey}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Save Credentials'}</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.header}>Device Sync</Text>
      <Text style={styles.description}>
        Your Expo Push Token is used to notify your device of sync events.
      </Text>

      <View style={styles.tokenContainer}>
        <Text style={styles.tokenText} selectable={true}>
          {pushToken || 'Fetching token...'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={copyToClipboard}
        disabled={!pushToken}
      >
        <Text style={styles.secondaryButtonText}>Copy Push Token</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 30,
  },
  tokenContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tokenText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
