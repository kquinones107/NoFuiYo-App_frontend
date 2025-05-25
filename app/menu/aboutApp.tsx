import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Colors from '../../src/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutAppScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>ℹ️ Acerca de la App</Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.text}>
              Esta aplicación fue desarrollada con el propósito de facilitar la organización de los quehaceres del hogar entre los miembros que conviven en una misma casa. Con esta herramienta podrás:
            </Text>
            <Text style={styles.text}>• Asignar y visualizar tareas del hogar</Text>
            <Text style={styles.text}>• Llevar un historial de actividades completadas</Text>
            <Text style={styles.text}>• Registrar evidencias con fotografías</Text>
            <Text style={styles.text}>• Evaluar el rendimiento de cada integrante del hogar</Text>
            <Text style={styles.text}>• Usar una ruleta aleatoria para asignaciones especiales</Text>
            <Text style={styles.text}>• Consultar estadísticas mensuales</Text>
            <Text style={styles.text}>
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
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  text: {
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 10,
  },
});
