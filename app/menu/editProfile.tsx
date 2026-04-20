import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { AuthContext } from '../../src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../../src/api/axios';

export default function EditProfileScreen() {
  const { token, user, setUser } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <IconButton
          icon="arrow-left"
          iconColor={colors.textPrimary}
          size={24}
          onPress={() => router.back()}
        />
        <Text style={[styles.title, { color: colors.textPrimary }]}>✏️ Editar Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.form}>
        <TextInput
          label="Nombre"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.inputBackground }]}
        />

        <TextInput
          label="Correo"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.inputBackground }]}
        />

        <Button
          mode="contained"
          onPress={handleUpdate}
          loading={loading}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          Guardar Cambios
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
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
  form: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {},
});
