import { Stack } from "expo-router";
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from "../src/context/AuthContext";
import { CustomTheme } from "../src/constants/Theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider theme={CustomTheme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </AuthProvider>
  );
}