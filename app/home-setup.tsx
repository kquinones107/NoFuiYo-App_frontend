import { useAuth } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../src/api/axios';
import { useTheme } from '../src/context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function HomeSetupScreen() {
  const { getToken, isLoaded } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const createHome = async () => {
    if (!name.trim()) return Alert.alert('Nombre requerido', 'Escribe un nombre para el hogar');
    if (!isLoaded) return;

    console.log('[HomeSetup] isLoaded:', isLoaded);
    const sessionToken = await getToken();
    console.log('[HomeSetup] sessionToken present:', !!sessionToken);
    console.log('[HomeSetup] sessionToken preview:', sessionToken ? sessionToken.slice(0, 30) + '...' : 'NULL');

    if (!sessionToken) {
      return Alert.alert('Sesión', 'No hay sesión activa. Cierra sesión e inicia de nuevo.');
    }

    try {
      setLoading(true);
      console.log('[HomeSetup] POSTing /home/create with name:', name);
      const res = await API.post('/home/create', { name });
      console.log('[HomeSetup] ✅ createHome success:', JSON.stringify(res.data));
      Alert.alert('✅ Hogar creado correctamente');
      router.replace('/home');
    } catch (err: any) {
      console.log('[HomeSetup] ❌ createHome failed');
      console.log('[HomeSetup] status:', err?.response?.status);
      console.log('[HomeSetup] data:', JSON.stringify(err?.response?.data));
      console.log('[HomeSetup] message:', err?.message);
      Alert.alert('Error', `No se pudo crear el hogar\n${err?.response?.data?.message ?? err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const joinHome = async () => {
    if (!code.trim()) return Alert.alert('Código requerido', 'Ingresa un código de hogar');
    if (!isLoaded) return;
    const sessionToken = await getToken();
    if (!sessionToken) {
      return Alert.alert('Sesión', 'No hay sesión activa. Cierra sesión e inicia de nuevo.');
    }
    try {
      setLoading(true);
      await API.post(`/home/join/${encodeURIComponent(code.trim())}`, {});
      Alert.alert('✅ Te uniste al hogar correctamente');
      router.replace('/home');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo unir al hogar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
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
            <IconButton
              icon="arrow-left"
              iconColor="#FFFFFF"
              size={24}
              onPress={() => router.back()}
              style={styles.backButton}
            />
            <Text variant="headlineMedium" style={styles.headerTitle}>🏠 Configurar Hogar</Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Crea un nuevo hogar o únete a uno existente
            </Text>
          </LinearGradient>

          {/* Create Home Card */}
          <Card style={[styles.formCard, { backgroundColor: colors.backgroundSecondary }]} elevation={4}>
            <Card.Content style={styles.formContent}>
              <Text variant="headlineSmall" style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Crear un nuevo hogar
              </Text>
              <Text variant="bodyMedium" style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Establece tu hogar y comparte el código con tu familia
              </Text>

              <TextInput
                label="Nombre del hogar"
                value={name}
                onChangeText={setName}
                style={[styles.input, { backgroundColor: colors.inputBackground }]}
                mode="outlined"
                left={<TextInput.Icon icon="home" />}
              />

              <Button
                mode="contained"
                onPress={createHome}
                loading={loading}
                style={[styles.button, { backgroundColor: colors.primary }]}
                contentStyle={styles.buttonContent}
              >
                Crear hogar
              </Button>
            </Card.Content>
          </Card>

          {/* Join Home Card */}
          <Card style={[styles.formCard, { backgroundColor: colors.backgroundSecondary }]} elevation={4}>
            <Card.Content style={styles.formContent}>
              <Text variant="headlineSmall" style={[styles.cardTitle, { color: colors.textPrimary }]}>
                ¿Tienes un código?
              </Text>
              <Text variant="bodyMedium" style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Únete a un hogar existente con el código de invitación
              </Text>

              <TextInput
                label="Código de hogar"
                value={code}
                onChangeText={setCode}
                style={[styles.input, { backgroundColor: colors.inputBackground }]}
                mode="outlined"
                left={<TextInput.Icon icon="key" />}
              />

              <Button
                mode="outlined"
                onPress={joinHome}
                loading={loading}
                style={[styles.secondaryButton, { borderColor: colors.primary }]}
                contentStyle={styles.buttonContent}
              >
                Unirse al hogar
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -8,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  formCard: {
    margin: 20,
    marginTop: -20,
    borderRadius: 20,
  },
  formContent: {
    padding: 24,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    borderRadius: 12,
    elevation: 2,
  },
  secondaryButton: {
    borderWidth: 2,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
