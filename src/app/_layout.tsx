import '../polyfill';
import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import * as Notifications from 'expo-notifications';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import { updateSessionStatus } from '@/services/db';
import { useAppStore } from '@/store';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { refreshOutbox } = useAppStore();

  useEffect(() => {
    registerForPushNotificationsAsync();

    const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
      const data = notification.request.content.data;
      if (data?.type === 'parse_failure' && data?.session_id) {
        await updateSessionStatus(data.session_id, 'failed', 'Parse Failure (Server)');
        refreshOutbox();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshOutbox]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
