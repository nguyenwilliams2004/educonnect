/**
 * SafeImage — cross-platform image component.
 * Uses native <img> on web to avoid react-native-web's Image constructor bug.
 * Uses RN Image on iOS/Android.
 */
import React from 'react';
import { Platform, Image, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';

interface SafeImageProps {
  uri?: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  fallbackText?: string;
  fallbackBg?: string;
}

export default function SafeImage({ uri, style, resizeMode = 'cover', fallbackText, fallbackBg }: SafeImageProps) {
  const flat = StyleSheet.flatten(style) as any ?? {};

  if (Platform.OS === 'web') {
    if (!uri && fallbackText) {
      return (
        <View style={[flat, { backgroundColor: (fallbackBg ?? '#e0e0e0') + '30', alignItems: 'center', justifyContent: 'center' }]}>
          <span style={{ fontWeight: 700, fontSize: (flat.width ?? 40) * 0.4, color: fallbackBg ?? '#666' }}>
            {fallbackText}
          </span>
        </View>
      );
    }
    const objectFitMap: Record<string, string> = {
      cover: 'cover', contain: 'contain', stretch: 'fill', center: 'none',
    };
    return (
      <img
        src={uri}
        style={{
          width: flat.width,
          height: flat.height,
          borderRadius: flat.borderRadius,
          objectFit: objectFitMap[resizeMode] as any,
          display: 'block',
          flexShrink: 0,
          backgroundColor: flat.backgroundColor ?? '#f0f0f0',
        }}
        alt=""
      />
    );
  }

  // Native
  return <Image source={{ uri }} style={style} resizeMode={resizeMode} />;
}
