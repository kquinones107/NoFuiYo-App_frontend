import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, Checkbox, Text, TextInput } from 'react-native-paper';
import { useTheme } from '../src/context/ThemeContext';

import { useSignIn } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

const { height } = Dimensions.get('window');

const CREDENTIALS_KEY = 'nofuiyo_saved_credentials_v1';

type SavedCreds = {
  email: string;
  password: string;
  rememberMe: boolean;
};

async function saveCredentials(data: SavedCreds) {
  try {
    await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(data));
  } catch {}
}

async function loadCredentials(): Promise<SavedCreds> {
  try {
    const raw = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    if (!raw) return { email: '', password: '', rememberMe: false };

    const parsed = JSON.parse(raw);
    return {
      email: parsed?.email ?? '',
      password: parsed?.password ?? '',
      rememberMe: !!parsed?.rememberMe,
    };
  } catch {
    return { email: '', password: '', rememberMe: false };
  }
}

async function clearCredentials() {
  try {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
  } catch {}
}

export default function LoginScreen() {
  const { colors } = useTheme();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [code, setCode] = useState('');
  const [pendingSecondFactor, setPendingSecondFactor] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const saved = await loadCredentials();
      setEmail(saved.email);
      setPassword(saved.password);
      setRememberMe(saved.rememberMe);
    })();
  }, []);

  const finishLogin = async (createdSessionId: string) => {
    await setActive({ session: createdSessionId });
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (rememberMe) {
      await saveCredentials({
        email: email.trim(),
        password,
        rememberMe: true,
      });
    } else {
      await clearCredentials();
    }

    router.replace('/home');
  };

  const onLogin = async () => {
    setErrorMsg(null);

    if (!isLoaded) {
      setErrorMsg('Clerk todavía está cargando. Intenta de nuevo.');
      return;
    }

    if (!email || !password) {
      setErrorMsg('Por favor completa correo y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn.create({
        identifier: email.trim(),
        password,
      });

      console.log('[Login] signIn result:', JSON.stringify(res, null, 2));
      console.log('[Login] status:', res.status);
      console.log('[Login] createdSessionId:', res.createdSessionId);

      if (res.createdSessionId) {
        await finishLogin(res.createdSessionId);
        return;
      }

      if (res.status === 'needs_second_factor') {
        const hasEmailCode = res.supportedSecondFactors?.some(
          (factor: any) => factor.strategy === 'email_code'
        );

        if (!hasEmailCode) {
          setErrorMsg('Tu cuenta requiere un segundo factor no soportado todavía por esta pantalla.');
          return;
        }

        await signIn.prepareSecondFactor({
          strategy: 'email_code',
        });

        setPendingSecondFactor(true);
        setErrorMsg('Te enviamos un código a tu correo. Escríbelo para continuar.');
        return;
      }

      setErrorMsg(`No se pudo completar el inicio de sesión. Estado actual: ${res.status || 'desconocido'}`);
    } catch (err: any) {
      console.log('[Login] error raw:', err);
      console.log('[Login] error json:', JSON.stringify(err, null, 2));

      const msg =
        err?.errors?.[0]?.message ||
        err?.message ||
        'No se pudo iniciar sesión. Verifica tus datos e intenta de nuevo.';

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySecondFactor = async () => {
    setErrorMsg(null);

    if (!isLoaded) {
      setErrorMsg('Clerk todavía está cargando. Intenta de nuevo.');
      return;
    }

    if (!code) {
      setErrorMsg('Ingresa el código que llegó a tu correo.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      });

      console.log('[Login] second factor result:', JSON.stringify(result, null, 2));
      console.log('[Login] second factor status:', result.status);
      console.log('[Login] second factor createdSessionId:', result.createdSessionId);

      if (!result.createdSessionId) {
        setErrorMsg(`No se pudo completar la verificación. Estado actual: ${result.status || 'desconocido'}`);
        return;
      }

      await finishLogin(result.createdSessionId);
    } catch (err: any) {
      console.log('[Login] second factor error raw:', err);
      console.log('[Login] second factor error json:', JSON.stringify(err, null, 2));

      const msg =
        err?.errors?.[0]?.message ||
        err?.message ||
        'El código no es válido o expiró. Intenta nuevamente.';

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onBackToPassword = () => {
    setPendingSecondFactor(false);
    setCode('');
    setErrorMsg(null);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text variant="headlineLarge" style={styles.appTitle}>
              NoFuiYo
            </Text>
            <Text variant="titleMedium" style={styles.appSubtitle}>
              App
            </Text>
          </View>
        </LinearGradient>

        <Card
          style={[styles.formCard, { backgroundColor: colors.cardBackground }]}
          elevation={4}
        >
          <Card.Content style={styles.formContent}>
            <Text
              variant="headlineSmall"
              style={[styles.formTitle, { color: colors.textPrimary }]}
            >
              {!pendingSecondFactor ? '¡Bienvenido de vuelta!' : 'Verifica tu inicio de sesión'}
            </Text>

            <Text
              variant="bodyMedium"
              style={[styles.formSubtitle, { color: colors.textSecondary }]}
            >
              {!pendingSecondFactor
                ? 'Inicia sesión para continuar'
                : 'Te enviamos un código a tu correo. Escríbelo abajo para completar el ingreso.'}
            </Text>

            {errorMsg ? (
              <Text style={{ color: colors.error, marginBottom: 12, textAlign: 'center' }}>
                {errorMsg}
              </Text>
            ) : null}

            {!pendingSecondFactor ? (
              <>
                <TextInput
                  label="Correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={[styles.input, { backgroundColor: colors.inputBackground }]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  left={<TextInput.Icon icon="email" />}
                />

                <TextInput
                  label="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  mode="outlined"
                  style={[styles.input, { backgroundColor: colors.inputBackground }]}
                  autoComplete="password"
                  left={<TextInput.Icon icon="lock" />}
                />

                <View style={styles.rememberMeContainer}>
                  <Checkbox
                    status={rememberMe ? 'checked' : 'unchecked'}
                    onPress={() => setRememberMe(!rememberMe)}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.rememberMeText, { color: colors.textPrimary }]}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    Recordar mis datos
                  </Text>
                </View>

                <Button
                  mode="contained"
                  onPress={onLogin}
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  disabled={isLoading}
                  loading={isLoading}
                  contentStyle={styles.buttonContent}
                >
                  {isLoading ? 'Entrando...' : 'Iniciar Sesión'}
                </Button>

                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.gray300 }]} />
                  <Text style={[styles.dividerText, { color: colors.textTertiary }]}>o</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.gray300 }]} />
                </View>

                <Button
                  mode="outlined"
                  onPress={() => router.push('/register')}
                  style={[styles.secondaryButton, { borderColor: colors.primary }]}
                  contentStyle={styles.buttonContent}
                >
                  Crear cuenta nueva
                </Button>
              </>
            ) : (
              <>
                <TextInput
                  label="Código de verificación"
                  value={code}
                  onChangeText={setCode}
                  mode="outlined"
                  style={[styles.input, { backgroundColor: colors.inputBackground }]}
                  keyboardType="number-pad"
                  left={<TextInput.Icon icon="shield-key" />}
                />

                <Button
                  mode="contained"
                  onPress={onVerifySecondFactor}
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  disabled={isLoading}
                  loading={isLoading}
                  contentStyle={styles.buttonContent}
                >
                  {isLoading ? 'Verificando...' : 'Verificar y continuar'}
                </Button>

                <Button
                  mode="text"
                  onPress={onBackToPassword}
                  disabled={isLoading}
                  style={{ marginTop: 8 }}
                >
                  Volver
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            ¿Olvidaste tu contraseña?{' '}
            <Text style={[styles.footerLink, { color: colors.link }]}>
              Recuperar aquí
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  header: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  logoContainer: { alignItems: 'center', justifyContent: 'center' },
  logo: { width: 80, height: 80, marginBottom: 10 },
  appTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  appSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  formCard: {
    margin: 20,
    marginTop: -30,
    borderRadius: 20,
  },
  formContent: { padding: 24 },
  formTitle: { textAlign: 'center', fontWeight: 'bold', marginBottom: 8 },
  formSubtitle: { textAlign: 'center', marginBottom: 32 },
  input: { marginBottom: 16 },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  rememberMeText: { marginLeft: 8, fontSize: 14 },
  button: { marginTop: 8, borderRadius: 12, elevation: 2 },
  buttonContent: { paddingVertical: 8 },
  secondaryButton: { borderWidth: 2, borderRadius: 12, marginTop: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 16, fontSize: 14 },
  footer: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  footerText: { textAlign: 'center', fontSize: 14 },
  footerLink: { fontWeight: '600' },
});