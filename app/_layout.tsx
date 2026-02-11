import * as Sentry from '@sentry/react-native';
import { Stack } from "expo-router";
import { Provider as PaperProvider } from 'react-native-paper';
import sentryConfig from "../sentry.config";
import { getCustomTheme } from "../src/constants/Theme";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";

Sentry.init({
  dsn: 'https://e2e4a7ed88a5d6c83f3e3f8c1ed2c1b9@o4505704020377600.ingest.us.sentry.io/4510864849764352',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
  debug: sentryConfig.debug,
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