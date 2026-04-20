import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Checkbox, Text, TextInput } from 'react-native-paper';
import { useTheme } from '../src/context/ThemeContext';

import { useSignUp } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

const { height } = Dimensions.get('window');

const CREDENTIALS_KEY = 'nofuiyo_saved_credentials_v1';

type SavedCreds = { email: string; password: string; rememberMe: boolean };

async function saveCredentials(data: SavedCreds) {
  try {
    await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(data));
  } catch {}
}

async function clearCredentials() {
  try {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
  } catch {}
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const onRegister = async () => {
    setErrorMsg(null);
    if (!isLoaded) return;

    if (!name || !email || !password) {
      setErrorMsg('Completa nombre, correo y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const { firstName, lastName } = splitName(name);

      await signUp.create({
        emailAddress: email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.message ||
        'No se pudo crear la cuenta. Revisa los datos e intenta de nuevo.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyCode = async () => {
    setErrorMsg(null);
    if (!isLoaded) return;

    if (!code) {
      setErrorMsg('Ingresa el código que llegó a tu correo.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code });

      await setActive({ session: res.createdSessionId });

      if (rememberMe) {
        await saveCredentials({ email, password, rememberMe: true });
      } else {
        await clearCredentials();
      }

      // Same as login: let AuthGuard redirect after session is active (avoids /home → /login race).
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.message ||
        'El código no es válido o expiró. Intenta nuevamente.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
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
            <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text variant="headlineLarge" style={styles.appTitle}>NoFuiYo</Text>
            <Text variant="titleMedium" style={styles.appSubtitle}>App</Text>
          </View>
        </LinearGradient>

        <Card style={[styles.formCard, { backgroundColor: colors.backgroundSecondary }]} elevation={4}>
          <Card.Content style={styles.formContent}>
            <Text variant="headlineSmall" style={[styles.formTitle, { color: colors.textPrimary }]}>
              {!pendingVerification ? '¡Únete a nosotros!' : 'Verifica tu correo'}
            </Text>
            <Text variant="bodyMedium" style={[styles.formSubtitle, { color: colors.textSecondary }]}>
              {!pendingVerification
                ? 'Crea tu cuenta para comenzar'
                : 'Te enviamos un código a tu correo. Escríbelo abajo.'}
            </Text>

            {errorMsg ? (
              <Text style={{ color: colors.error, marginBottom: 12, textAlign: 'center' }}>
                {errorMsg}
              </Text>
            ) : null}

            {!pendingVerification ? (
              <>
                <TextInput
                  label="Nombre completo"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={[styles.input, { backgroundColor: colors.inputBackground }]}
                  autoCapitalize="words"
                  autoComplete="name"
                  left={<TextInput.Icon icon="account" />}
                />

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
                  onPress={onRegister}
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  disabled={isLoading}
                  loading={isLoading}
                  contentStyle={styles.buttonContent}
                >
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>

                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.inputBorder }]} />
                  <Text style={[styles.dividerText, { color: colors.textSecondary }]}>o</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.inputBorder }]} />
                </View>

                <Button
                  mode="outlined"
                  onPress={() => router.push('/login')}
                  style={[styles.secondaryButton, { borderColor: colors.primary }]}
                  contentStyle={styles.buttonContent}
                >
                  Ya tengo cuenta
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
                  onPress={onVerifyCode}
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  disabled={isLoading}
                  loading={isLoading}
                  contentStyle={styles.buttonContent}
                >
                  {isLoading ? 'Verificando...' : 'Verificar y continuar'}
                </Button>

                <Button
                  mode="text"
                  onPress={() => setPendingVerification(false)}
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
            Al registrarte, aceptas nuestros{' '}
            <Text style={[styles.footerLink, { color: colors.link }]}>Términos de Servicio</Text> y{' '}
            <Text style={[styles.footerLink, { color: colors.link }]}>Política de Privacidad</Text>
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
  appTitle: { color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  appSubtitle: { color: '#FFFFFF', opacity: 0.9, textAlign: 'center' },
  formCard: {
    margin: 20,
    marginTop: -30,
    borderRadius: 20,
  },
  formContent: { padding: 24 },
  formTitle: { textAlign: 'center', fontWeight: 'bold', marginBottom: 8 },
  formSubtitle: { textAlign: 'center', marginBottom: 32 },
  input: { marginBottom: 16 },
  rememberMeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 8 },
  rememberMeText: { marginLeft: 8, fontSize: 14 },
  button: { marginTop: 8, borderRadius: 12, elevation: 2 },
  buttonContent: { paddingVertical: 8 },
  secondaryButton: { borderWidth: 2, borderRadius: 12, marginTop: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 16, fontSize: 14 },
  footer: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  footerText: { textAlign: 'center', fontSize: 14, lineHeight: 20 },
  footerLink: { fontWeight: '600' },
});
