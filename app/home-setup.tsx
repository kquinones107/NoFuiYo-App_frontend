import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { AuthContext } from '../src/context/AuthContext';
import API from '../src/api/axios';
import { router } from 'expo-router';
import Colors from '../src/constants/Colors';

export default function HomeSetupScreen() {
  const { token } = useContext(AuthContext);

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
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>🏠 Crear un nuevo hogar</Text>
      <TextInput
        label="Nombre del hogar"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
      />
      <Button mode="contained" onPress={createHome} loading={loading} style={styles.button}>
        Crear hogar
      </Button>

      <Text variant="titleMedium" style={styles.title}>🔑 ¿Tienes un código?</Text>
      <TextInput
        label="Código de hogar"
        value={code}
        onChangeText={setCode}
        style={styles.input}
        mode="outlined"
      />
      <Button mode="outlined" onPress={joinHome} loading={loading} style={styles.button}>
        Unirse al hogar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: Colors.textDark,
  },
  input: {
    marginBottom: 10,
    backgroundColor: Colors.inputBackground,
  },
  button: {
    marginVertical: 10,
    backgroundColor: Colors.button,
  },
});
