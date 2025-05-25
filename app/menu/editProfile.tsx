import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import Colors from '../../src/constants/Colors';
import { AuthContext } from '../../src/context/AuthContext';
import API from '../../src/api/axios';

export default function EditProfileScreen() {
  const { token, user, setUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim() || !email.trim()) {
      return Alert.alert('Campos requeridos', 'Nombre y correo no pueden estar vacíos.');
    }

    try {
      setLoading(true);
      const res = await API.put(
        '/auth/profile',
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Perfil actualizado');
      setUser(res.data.user);
    } catch (err) {
      console.error('Error al actualizar perfil', err);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✏️ Editar Perfil</Text>

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

      <Button
        mode="contained"
        onPress={handleUpdate}
        loading={loading}
        style={styles.button}
      >
        Guardar Cambios
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: Colors.inputBackground,
  },
  button: {
    backgroundColor: Colors.button,
  },
});
