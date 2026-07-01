import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Colors } from '@/constants/theme';

// Polyfill: React Native Web calls Image() without 'new' in some internal paths.
// This wraps HTMLImageElement so both Image() and new Image() work correctly.
if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.Image === 'function') {
  const _NativeImage = window.Image;
  // @ts-ignore
  window.Image = function Image(...args: any[]) {
    // If called without 'new', create via Reflect to avoid TypeError
    if (!(this instanceof window.Image)) {
      return new (_NativeImage as any)(...args);
    }
    return new (_NativeImage as any)(...args);
  };
  window.Image.prototype = _NativeImage.prototype;
  Object.defineProperty(window.Image, 'name', { value: 'Image' });
}

export default function RootLayout() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const navigationRef = useNavigationContainerRef();
  const [navReady, setNavReady] = useState(false);

  const [fontsLoaded] = useFonts(
    Platform.OS === 'web'
      ? {}
      : {
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
          Inter_700Bold,
          Manrope_600SemiBold,
          Manrope_700Bold,
          Manrope_800ExtraBold,
        }
  );

  const isLoaded = Platform.OS === 'web' ? true : fontsLoaded;

  useEffect(() => {
    if (Platform.OS === 'web') {
      const linkId = 'expo-google-fonts';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap';
        document.head.appendChild(link);
      }
    }
  }, []);

  // Wait for navigation to be ready before redirecting
  useEffect(() => {
    if (navigationRef?.isReady()) {
      setNavReady(true);
    }
  });

  useEffect(() => {
    if (!isLoaded || !navReady) return;
    const inAuthGroup = segments[0] === '(auth)';
    // Only redirect logged-in users away from auth pages
    // Guests can browse freely — login is prompted only when needed (e.g. registering a class)
    if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, segments, isLoaded, navReady]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="tutor/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Hồ sơ chuyên gia',
            headerTintColor: Colors.primary,
            headerStyle: { backgroundColor: Colors.surface },
            headerShadowVisible: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            headerShown: true,
            headerTintColor: Colors.primary,
            headerStyle: { backgroundColor: Colors.surface },
            headerShadowVisible: false,
            presentation: 'card',
          }}
        />
      </Stack>
    </>
  );
}

