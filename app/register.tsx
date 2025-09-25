import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Checkbox, Text, TextInput } from 'react-native-paper';
import { AuthContext } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useContext(AuthContext);
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

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

        {/* Register Form Card */}
        <Card style={styles.formCard} elevation={4}>
          <Card.Content style={styles.formContent}>
            <Text variant="headlineSmall" style={styles.formTitle}>
              ¡Únete a nosotros!
            </Text>
            <Text variant="bodyMedium" style={styles.formSubtitle}>
              Crea tu cuenta para comenzar
            </Text>

            <TextInput
              label="Nombre completo"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              autoCapitalize="words"
              autoComplete="name"
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
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
              style={styles.input}
              autoComplete="password"
              left={<TextInput.Icon icon="lock" />}
            />

            {/* Remember Me Checkbox */}
            <View style={styles.rememberMeContainer}>
              <Checkbox
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(!rememberMe)}
                color={Colors.primary}
              />
              <Text 
                style={styles.rememberMeText}
                onPress={() => setRememberMe(!rememberMe)}
              >
                Recordar mis datos
              </Text>
            </View>

            <Button 
              mode="contained" 
              onPress={() => register(name, email, password, rememberMe)} 
              style={styles.button}
              disabled={isLoading}
              loading={isLoading}
              contentStyle={styles.buttonContent}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button 
              mode="outlined" 
              onPress={() => router.push('/login')} 
              style={styles.secondaryButton}
              contentStyle={styles.buttonContent}
            >
              Ya tengo cuenta
            </Button>
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Al registrarte, aceptas nuestros{' '}
            <Text style={styles.footerLink}>Términos de Servicio</Text>
            {' '}y{' '}
            <Text style={styles.footerLink}>Política de Privacidad</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.buttonText,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  appSubtitle: {
    color: Colors.buttonText,
    opacity: 0.9,
    textAlign: 'center',
  },
  formCard: {
    margin: 20,
    marginTop: -30,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
  },
  formContent: {
    padding: 24,
  },
  formTitle: {
    textAlign: 'center',
    color: Colors.textDark,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formSubtitle: {
    textAlign: 'center',
    color: Colors.textLight,
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
    backgroundColor: Colors.inputBackground,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  rememberMeText: {
    marginLeft: 8,
    color: Colors.textDark,
    fontSize: 14,
  },
  button: {
    backgroundColor: Colors.primary,
    marginTop: 8,
    borderRadius: 12,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  secondaryButton: {
    borderColor: Colors.primary,
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
    backgroundColor: Colors.grayLight,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footerText: {
    color: Colors.textLight,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  footerLink: {
    color: Colors.link,
    fontWeight: '600',
  },
});
