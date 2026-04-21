import { useAuth } from '@clerk/clerk-expo';
import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Alert } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../../src/api/axios';

export default function CompleteTaskScreen() {
  const { taskId } = useLocalSearchParams();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { getToken } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería para subir evidencias.');
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Falta imagen', 'Por favor selecciona una imagen');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('image', {
        uri: image,
        name: 'evidencia.jpg',
        type: 'image/jpeg',
      } as any);

      const uploadRes = await API.post('/upload', formData);

      const imageUrl = uploadRes.data.url;

      const t = await getToken();
      await API.post(
        `/history/${taskId}/complete`,
        { photoUrl: imageUrl },
        { headers: { Authorization: `Bearer ${t}` } }
      );

      Alert.alert('✅ Tarea registrada');
      router.replace('/tasks');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo completar la tarea');
    } finally {
      setUploading(false);
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
        <Text variant="titleMedium" style={[styles.title, { color: colors.textPrimary }]}>
          Completar Tarea
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {image && <Image source={{ uri: image }} style={styles.image} />}

        <Button
          icon="image"
          mode="outlined"
          onPress={pickImage}
          style={styles.button}
        >
          Subir Imagen 📸
        </Button>

        <Button
          icon="check"
          mode="contained"
          onPress={handleSubmit}
          disabled={!image || uploading}
          loading={uploading}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          Marcar como Hecha
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
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 20,
  },
});
