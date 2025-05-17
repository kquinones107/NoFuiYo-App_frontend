import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AuthContext } from '../src/context/AuthContext';
import Colors from '../src/constants/Colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Crear Cuenta</Text>

      <TextInput
        label="Nombre"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Correo"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />

      <Button mode="contained" onPress={() => register(name, email, password)} style={styles.button}>
        Registrarse
      </Button>

      <Text style={styles.link} onPress={() => router.push('/login')}>
        ¿Ya tienes cuenta? Inicia sesión
      </Text>
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
    marginBottom: 30,
    color: Colors.textDark,
  },
  input: {
    marginBottom: 15,
    backgroundColor: Colors.inputBackground,
  },
  button: {
    backgroundColor: Colors.button,
    marginTop: 10,
  },
  link: {
    textAlign: 'center',
    marginTop: 20,
    color: Colors.link,
    textDecorationLine: 'underline',
  },
});
