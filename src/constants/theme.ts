/**
 * Theme constants for the Nothing OS-inspired design.
 * Glassmorphic dark mode with subtle red-to-black gradient accent.
 */

import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    backgroundElement: '#F5F5F5',
    backgroundSelected: '#E5E5E5',
    textSecondary: '#666666',
    textTertiary: '#999999',
    primary: '#000000',
    primaryText: '#FFFFFF',
    danger: '#FF0033',
    dangerText: '#FFFFFF',
    success: '#059669',
    successBg: '#D1FAE5',
    warning: '#D97706',
    warningBg: '#FEF3C7',
    border: '#E5E5E5',
    glass: 'rgba(245, 245, 245, 0.85)',
    glassBorder: 'rgba(0, 0, 0, 0.06)',
    gradientStart: '#FFFFFF',
    gradientEnd: '#F0F0F0',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    backgroundElement: '#111111',
    backgroundSelected: '#222222',
    textSecondary: '#888888',
    textTertiary: '#555555',
    primary: '#FFFFFF',
    primaryText: '#000000',
    danger: '#FF0033',
    dangerText: '#FFFFFF',
    success: '#34D399',
    successBg: 'rgba(52, 211, 153, 0.15)',
    warning: '#FBBF24',
    warningBg: 'rgba(251, 191, 36, 0.15)',
    border: '#1A1A1A',
    glass: 'rgba(20, 20, 20, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.06)',
    gradientStart: '#0A0000',
    gradientEnd: '#000000',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansBold: 'Inter_700Bold',
  display: 'Doto_400Regular',
  mono: 'monospace',
};

export type AppTheme = typeof Colors.light | typeof Colors.dark;

export const Spacing = {
  half: 4,
  one: 8,
  oneHalf: 12,
  two: 16,
  twoHalf: 20,
  three: 24,
  four: 32,
  five: 48,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
