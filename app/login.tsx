import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Checkbox, Text, TextInput } from 'react-native-paper';
import { AuthContext } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { login, isLoading, loadSavedCredentials } = useContext(AuthContext);
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials on component mount
  React.useEffect(() => {
    const loadCredentials = async () => {
      const savedCredentials = await loadSavedCredentials();
      setEmail(savedCredentials.email);
      setPassword(savedCredentials.password);
      setRememberMe(savedCredentials.rememberMe);
    };
    loadCredentials();
  }, []);

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
        {/* Header with logo and gradient */}
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
            <Text variant="headlineLarge" style={styles.appTitle}>NoFuiYo</Text>
            <Text variant="titleMedium" style={styles.appSubtitle}>App</Text>
          </View>
        </LinearGradient>

        {/* Login Form Card */}
        <Card style={[styles.formCard, { backgroundColor: colors.cardBackground }]} elevation={4}>
          <Card.Content style={styles.formContent}>
            <Text variant="headlineSmall" style={[styles.formTitle, { color: colors.textPrimary }]}>
              ¡Bienvenido de vuelta!
            </Text>
            <Text variant="bodyMedium" style={[styles.formSubtitle, { color: colors.textSecondary }]}>
              Inicia sesión para continuar
            </Text>

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

            {/* Remember Me Checkbox */}
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
              onPress={() => login(email, password, rememberMe)} 
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
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            ¿Olvidaste tu contraseña?{' '}
            <Text style={[styles.footerLink, { color: colors.link }]}>Recuperar aquí</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
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
  formContent: {
    padding: 24,
  },
  formTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formSubtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  secondaryButton: {
    borderWidth: 2,
    borderRadius: 12,
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
  },
  footerLink: {
    fontWeight: '600',
  },
});
