import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutAppScreen() {
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
        <Text style={[styles.title, { color: colors.textPrimary }]}>ℹ️ Acerca de la App</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView>
        <Card style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
          <Card.Content>
            <Text style={[styles.text, { color: colors.textPrimary }]}>
              Esta aplicación fue desarrollada con el propósito de facilitar la organización de los quehaceres del hogar entre los miembros que conviven en una misma casa. Con esta herramienta podrás:
            </Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>• Asignar y visualizar tareas del hogar</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>• Llevar un historial de actividades completadas</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>• Registrar evidencias con fotografías</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>• Evaluar el rendimiento de cada integrante del hogar</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>• Usar una ruleta aleatoria para asignaciones especiales</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>• Consultar estadísticas mensuales</Text>
            <Text style={[styles.text, { color: colors.textPrimary }]}>
              Esta app está pensada para fomentar la equidad y responsabilidad compartida dentro del hogar, promoviendo un ambiente más colaborativo y organizado.
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
