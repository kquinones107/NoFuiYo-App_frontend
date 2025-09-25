import { Stack } from "expo-router";
import { Provider as PaperProvider } from 'react-native-paper';
import { getCustomTheme } from "../src/constants/Theme";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";

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