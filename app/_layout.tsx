import { Stack } from "expo-router";
import { Provider as PaperProvider } from 'react-native-paper';
import * as Sentry from "sentry-expo";
import { getCustomTheme } from "../src/constants/Theme";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import sentryConfig from "../sentry.config";

// Initialize Sentry
Sentry.init({
  dsn: sentryConfig.dsn,
  enableInExpoDevelopment: sentryConfig.enableInExpoDevelopment,
  debug: sentryConfig.debug,
  tracesSampleRate: sentryConfig.tracesSampleRate,
  enableAutoSessionTracking: sentryConfig.enableAutoSessionTracking,
  sessionTrackingIntervalMillis: sentryConfig.sessionTrackingIntervalMillis,
});

function AppContent() {
  const { theme } = useTheme();
  const customTheme = getCustomTheme(theme);

  return (
    <PaperProvider theme={customTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}