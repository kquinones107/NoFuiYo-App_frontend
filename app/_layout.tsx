import * as Sentry from '@sentry/react-native';
import { Stack } from "expo-router";
import { Provider as PaperProvider } from 'react-native-paper';
import sentryConfig from "../sentry.config";
import { getCustomTheme } from "../src/constants/Theme";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";

import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

import API, { setAuthTokenGetter } from "../src/api/axios";
import { useEffect } from "react";

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

function AppContent() {
  const { theme } = useTheme();
  const customTheme = getCustomTheme(theme);
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

  return (
    <PaperProvider theme={customTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}

export default function RootLayout() {
  if (!publishableKey) {
    // Esto evita que expo-router explote si falta la env var
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ClerkProvider>
  );
}