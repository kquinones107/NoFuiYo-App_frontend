import * as Sentry from '@sentry/react-native';
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider as PaperProvider } from 'react-native-paper';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import sentryConfig from "../sentry.config";
import { getCustomTheme } from "../src/constants/Theme";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";

import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

import { setAuthTokenGetter } from "../src/api/axios";
import { useEffect } from "react";

/** First screen on cold start (sign-in). Signed-in users are redirected from login → home. */
export const unstable_settings = {
  initialRouteName: "login",
};

Sentry.init({
  dsn: 'https://e2e4a7ed88a5d6c83f3e3f8c1ed2c1b9@o4505704020377600.ingest.us.sentry.io/4510864849764352',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
  debug: sentryConfig.debug,
});

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, token: string) {
    try {
      await SecureStore.setItemAsync(key, token);
    } catch {}
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

/** Screens that are accessible without being signed in. */
const PUBLIC_SEGMENTS = ['login', 'register', 'onboarding', 'index'];

function AuthGuard() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    const currentSegment = segments[0] as string | undefined;
    const inPublicRoute = !currentSegment || PUBLIC_SEGMENTS.includes(currentSegment);

    if (isSignedIn && inPublicRoute) {
      router.replace('/home');
    } else if (!isSignedIn && !inPublicRoute) {
      router.replace('/login');
    }
  }, [isSignedIn, isLoaded, segments, router]);

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7dd3fc" />
      </View>
    );
  }

  return null;
}

function AppContent() {
  const { theme } = useTheme();
  const customTheme = getCustomTheme(theme);

  return (
    <PaperProvider theme={customTheme}>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}

function MissingKeyScreen() {
  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackTitle}>NoFuiYo — Dev Mode</Text>
      <Text style={styles.fallbackBody}>
        Routing is working ✓{'\n\n'}
        Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in a{' '}
        <Text style={styles.code}>.env</Text> file to enable auth.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    padding: 32,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  fallbackBody: {
    fontSize: 15,
    color: '#aaaaaa',
    textAlign: 'center',
    lineHeight: 24,
  },
  code: {
    fontFamily: 'monospace',
    color: '#7dd3fc',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
});

export default function RootLayout() {
  if (!publishableKey) {
    return <MissingKeyScreen />;
  }

  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ClerkProvider>
  );
}