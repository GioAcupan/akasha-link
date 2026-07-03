import '../polyfill';
import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useFonts as useDoto, Doto_400Regular } from '@expo-google-fonts/doto';
import { 
  useFonts as useInter, 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import { updateSessionStatus } from '@/services/db';
import { useAppStore } from '@/store';
import { Colors } from '@/constants/theme';


SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { refreshOutbox } = useAppStore();

  const [dotoLoaded] = useDoto({ Doto_400Regular });
  const [interLoaded] = useInter({ Inter_400Regular, Inter_500Medium, Inter_700Bold });

  useEffect(() => {
    if (dotoLoaded && interLoaded) {
      // Hide the splash screen after the fonts have loaded and the
      // UI is ready.
      SplashScreen.hideAsync();
    }
  }, [dotoLoaded, interLoaded]);

  useEffect(() => {
    registerForPushNotificationsAsync();

    const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
      const data = notification.request.content.data;
      if (data?.type === 'parse_failure' && data?.session_id) {
        await updateSessionStatus(data.session_id as string, 'failed', 'Parse Failure (Server)');
        refreshOutbox();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshOutbox]);

  if (!dotoLoaded || !interLoaded) {
    return null;
  }

  // Create custom navigation themes that align with our Nothing OS aesthetic
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.background,
      card: 'transparent',
      text: Colors.dark.text,
      border: Colors.dark.border,
      primary: Colors.dark.primary,
    },
  };

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.background,
      card: 'transparent',
      text: Colors.light.text,
      border: Colors.light.border,
      primary: Colors.light.primary,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? customDarkTheme : customLightTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
