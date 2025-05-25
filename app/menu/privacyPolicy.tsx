import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Colors from '../../src/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>📜 Políticas de Privacidad</Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.text}>
              Esta aplicación respeta tu privacidad y la de los miembros de tu hogar. Nos comprometemos a proteger la información personal que compartes con nosotros. A continuación te explicamos cómo tratamos los datos:
            </Text>

            <Text style={styles.text}>• Solo solicitamos información mínima necesaria para el funcionamiento de la app (nombre, correo electrónico).</Text>
            <Text style={styles.text}>• No compartimos tus datos con terceros ni los usamos con fines comerciales.</Text>
            <Text style={styles.text}>• Las fotos que subas como evidencia se almacenan de forma segura y solo son visibles para los miembros del hogar.</Text>
            <Text style={styles.text}>• Puedes eliminar tu cuenta o salir de un hogar cuando lo desees.</Text>
            <Text style={styles.text}>• Cumplimos con estándares básicos de seguridad y cifrado.</Text>

            <Text style={styles.text}>
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