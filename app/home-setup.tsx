import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../src/api/axios';
import { AuthContext } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function HomeSetupScreen() {
  const { token } = useContext(AuthContext);
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const createHome = async () => {
    if (!name.trim()) return Alert.alert('Nombre requerido', 'Escribe un nombre para el hogar');
    try {
      setLoading(true);
      await API.post('/home/create', { name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('✅ Hogar creado correctamente');
      router.replace('/home');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo crear el hogar');
    } finally {
      setLoading(false);
    }
  };

  const joinHome = async () => {
    if (!code.trim()) return Alert.alert('Código requerido', 'Ingresa un código de hogar');
    try {
      setLoading(true);
      await API.post(`/home/join/${code}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
          {/* Header with gradient */}
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text variant="headlineMedium" style={styles.headerTitle}>🏠 Configurar Hogar</Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Crea un nuevo hogar o únete a uno existente
            </Text>
          </LinearGradient>

          {/* Create Home Card */}
          <Card style={styles.formCard} elevation={4}>
            <Card.Content style={styles.formContent}>
              <Text variant="headlineSmall" style={styles.cardTitle}>
                Crear un nuevo hogar
              </Text>
              <Text variant="bodyMedium" style={styles.cardSubtitle}>
                Establece tu hogar y comparte el código con tu familia
              </Text>

              <TextInput
                label="Nombre del hogar"
                value={name}
                onChangeText={setName}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="home" />}
              />

              <Button 
                mode="contained" 
                onPress={createHome} 
                loading={loading} 
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Crear hogar
              </Button>
            </Card.Content>
          </Card>

          {/* Join Home Card */}
          <Card style={styles.formCard} elevation={4}>
            <Card.Content style={styles.formContent}>
              <Text variant="headlineSmall" style={styles.cardTitle}>
                ¿Tienes un código?
              </Text>
              <Text variant="bodyMedium" style={styles.cardSubtitle}>
                Únete a un hogar existente con el código de invitación
              </Text>

              <TextInput
                label="Código de hogar"
                value={code}
                onChangeText={setCode}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="key" />}
              />

              <Button 
                mode="outlined" 
                onPress={joinHome} 
                loading={loading} 
                style={styles.secondaryButton}
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
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.buttonText,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: Colors.buttonText,
    opacity: 0.9,
    textAlign: 'center',
  },
  formCard: {
    margin: 20,
    marginTop: -20,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
  },
  formContent: {
    padding: 24,
  },
  cardTitle: {
    color: Colors.textDark,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: Colors.textLight,
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: Colors.inputBackground,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    elevation: 2,
  },
  secondaryButton: {
    borderColor: Colors.primary,
    borderWidth: 2,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
