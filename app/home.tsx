import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { AuthContext } from '../src/context/AuthContext';
import Colors from '../src/constants/Colors';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        ¡Hola {user?.name || 'Usuario'}! 👋
      </Text>

      <Text style={styles.subtitle}>
        Bienvenido a tu casa en orden 🧹
      </Text>

      <Button
        mode="contained"
        onPress={() => router.push('/tasks')}
        style={styles.button}
      >
        Ver Tareas
      </Button>

      <Button
        mode="outlined"
        onPress={() => router.push('/history')}
        style={styles.outlined}
      >
        Ver Historial
      </Button>

      <Button
        mode="text"
        onPress={logout}
        style={styles.logout}
      >
        Cerrar Sesión
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    color: Colors.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.grayMedium,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.button,
    marginBottom: 10,
    width: '100%',
  },
  outlined: {
    borderColor: Colors.button,
    width: '100%',
    marginBottom: 20,
  },
  logout: {
    width: '100%',
    marginTop: 10,
  },
});
