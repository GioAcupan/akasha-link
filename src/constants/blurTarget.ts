/**
 * Module-level ref shared between _layout.tsx (BlurTargetView)
 * and app-tabs.tsx (BlurView) so Android blur can reference
 * the content it should frost over.
 */
import { createRef } from 'react';
import { View } from 'react-native';

export const blurTargetRef = createRef<View | null>();
