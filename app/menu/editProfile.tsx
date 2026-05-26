import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';

import { useTheme } from '../../src/context/ThemeContext';
import API from '../../src/api/axios';

export default function EditProfileScreen() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { colors } = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    setName(user.fullName || user.firstName || user.username || '');
    setEmail(user.primaryEmailAddress?.emailAddress || '');
  }, [isLoaded, user]);

  const handleUpdate = async () => {
    if (!isLoaded || !isSignedIn) return;

    if (!name.trim() || !email.trim()) {
      return Alert.alert('Campos requeridos', 'Nombre y correo no pueden estar vacíos.');
    }

    try {
      setLoading(true);

      const res = await API.put('/auth/profile', { name, email });

      Alert.alert('Perfil actualizado');
      console.log('✅ Perfil actualizado:', res.data.user);
    } catch (err) {
      console.error('Error al actualizar perfil', err);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
  if (!isLoaded || !isSignedIn) return;

  try {
    setDeleting(true);

    await API.delete('/auth/delete-account');

    Alert.alert(
      'Cuenta eliminada',
      'Tu cuenta fue eliminada correctamente.',
      [
        {
          text: 'OK',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  } catch (err) {
    console.error('Error al eliminar cuenta', err);
    Alert.alert('Error', 'No se pudo eliminar la cuenta');
  } finally {
    setDeleting(false);
  }
};

const confirmDeleteAccount = () => {
  Alert.alert(
    'Eliminar cuenta',
    'Esta acción eliminará tu cuenta y no se puede deshacer. ¿Estás seguro?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: deleteAccount,
      },
    ]
  );
};

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.form}>
          <Text style={{ color: colors.textPrimary, textAlign: 'center' }}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          disabled={!isLoaded || !isSignedIn || loading}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          Guardar Cambios
        </Button>

        <Button
          mode="outlined"
          onPress={confirmDeleteAccount}
          loading={deleting}
          disabled={deleting}
          textColor={colors.error ?? '#EF4444'}
          style={[styles.deleteButton, { borderColor: colors.error ?? '#EF4444' }]}
        >
          Eliminar cuenta
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
  deleteButton: {
  marginTop: 16,
  borderWidth: 1.5,
},
});