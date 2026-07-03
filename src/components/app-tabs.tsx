import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Platform, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, Send, SlidersHorizontal } from 'lucide-react-native';
import { Colors, Fonts } from '@/constants/theme';
import { useAppStore } from '@/store';

/** Height of the custom tab bar — exported so screens can add matching bottom padding. */
export const TAB_BAR_HEIGHT = Platform.select({ ios: 88, android: 80 }) ?? 80;

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? Colors.dark : Colors.light;
  const isDark = scheme === 'dark';
  
  const activeBlurTarget = useAppStore((state) => state.activeBlurTarget);

  // Softened blur intensity and lowered tint opacity to make the frosted glass look cleaner and more transparent
  const nativeTint = isDark ? 'dark' : 'light';
  const nativeBlurIntensity = isDark ? 35 : 40;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: TAB_BAR_HEIGHT,
          backgroundColor: 'transparent',
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          elevation: 0,
          overflow: 'hidden',
          paddingBottom: Platform.select({ ios: 28, android: 20 }),
          paddingTop: 10,
        },
        tabBarBackground: () => (
          <BlurView
            blurTarget={activeBlurTarget as any}
            blurMethod="dimezisBlurView"
            tint={nativeTint}
            intensity={nativeBlurIntensity}
            style={[StyleSheet.absoluteFill, {
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.12)',
            }]}
          />
        ),
        tabBarLabelStyle: {
          fontFamily: Fonts.display,
          fontSize: 10,
          letterSpacing: 1.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color }) => <Home color={color} size={20} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="outbox"
        options={{
          title: 'OUTBOX',
          tabBarIcon: ({ color }) => <Send color={color} size={20} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ color }) => <SlidersHorizontal color={color} size={20} strokeWidth={1.8} />,
        }}
      />
    </Tabs>
  );
}
