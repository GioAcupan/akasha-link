import * as SecureStore from 'expo-secure-store';

export interface R2Credentials {
  endpoint: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
}

const CREDENTIALS_KEY = 'akasha_r2_credentials';

export async function saveR2Credentials(credentials: R2Credentials): Promise<void> {
  try {
    const jsonValue = JSON.stringify(credentials);
    await SecureStore.setItemAsync(CREDENTIALS_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving R2 credentials:', error);
    throw error;
  }
}

export async function getR2Credentials(): Promise<R2Credentials | null> {
  try {
    const jsonValue = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error retrieving R2 credentials:', error);
    return null;
  }
}

export async function hasValidCredentials(): Promise<boolean> {
  const credentials = await getR2Credentials();
  return !!(
    credentials &&
    credentials.endpoint &&
    credentials.bucket &&
    credentials.accessKey &&
    credentials.secretKey
  );
}
