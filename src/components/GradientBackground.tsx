import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

interface Props {
  children: React.ReactNode;
}

/**
 * A dual-tone radial gradient background.
 * Dark mode: warm red glow (top-left) + subtle cool wash (bottom-right).
 * Light mode: subtle warm tint.
 */
export default function GradientBackground({ children }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Warm red glow from top-left */}
          <RadialGradient id="warmGlow" cx="8%" cy="3%" rx="75%" ry="55%">
            <Stop offset="0" stopColor={isDark ? '#2A000D' : '#FFF0F0'} stopOpacity="1" />
            <Stop offset="0.45" stopColor={isDark ? '#100004' : '#FFF8F6'} stopOpacity="1" />
            <Stop offset="1" stopColor={isDark ? '#000000' : '#FFFFFF'} stopOpacity="1" />
          </RadialGradient>
          {/* Subtle cool wash from bottom-right */}
          <RadialGradient id="coolWash" cx="92%" cy="90%" rx="55%" ry="45%">
            <Stop offset="0" stopColor={isDark ? '#000D1A' : '#F0F4FF'} stopOpacity={isDark ? '0.35' : '0.5'} />
            <Stop offset="1" stopColor={isDark ? '#000000' : '#FFFFFF'} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#warmGlow)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#coolWash)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
