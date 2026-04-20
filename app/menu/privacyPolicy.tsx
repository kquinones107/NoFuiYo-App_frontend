import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <IconButton
          icon="arrow-left"
          iconColor={colors.textPrimary}
          size={24}
          onPress={() => router.back()}
        />
        <Text style={[styles.title, { color: colors.textPrimary }]}>📜 Políticas de Privacidad</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView>
        <Card style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
          <Card.Content>
            <Text style={[styles.text, { color: colors.textPrimary }]}>
              Esta aplicación respeta tu privacidad y la de los miembros de tu hogar. Nos comprometemos a proteger la información personal que compartes con nosotros. A continuación te explicamos cómo tratamos los datos:
            </Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>• Solo solicitamos información mínima necesaria para el funcionamiento de la app (nombre, correo electrónico).</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>• No compartimos tus datos con terceros ni los usamos con fines comerciales.</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>• Las fotos que subas como evidencia se almacenan de forma segura y solo son visibles para los miembros del hogar.</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>• Puedes eliminar tu cuenta o salir de un hogar cuando lo desees.</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>• Cumplimos con estándares básicos de seguridad y cifrado.</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>
              Al usar esta aplicación, aceptas estos términos y confías en que usamos tu información únicamente para ayudarte a organizar y mejorar la convivencia en casa.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: -8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  card: {
    borderRadius: 8,
    padding: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
});
