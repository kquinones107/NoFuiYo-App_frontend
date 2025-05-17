import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { AuthContext } from '../src/context/AuthContext';
import Colors from '../src/constants/Colors';

export default function LoginScreen() {
  
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Iniciar Sesión</Text>

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

      <Button mode="contained" onPress={() => login(email, password)} style={styles.button}>
        Entrar
      </Button>

      <Text style={styles.link} onPress={() => router.push('/register')}>
        ¿No tienes cuenta? Regístrate aquí
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
