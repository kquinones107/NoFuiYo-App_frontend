import { router } from 'expo-router';
import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import Colors from '../src/constants/Colors';
import { AuthContext } from '../src/context/AuthContext';

export default function LoginScreen() {
  
  const { login, isLoading } = useContext(AuthContext);

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

      <Button 
        mode="contained" 
        onPress={() => login(email, password)} 
        style={styles.button}
        disabled={isLoading}
        loading={isLoading}
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
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
