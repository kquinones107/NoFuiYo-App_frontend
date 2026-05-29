import { useAuth } from '@clerk/clerk-expo';
import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Alert } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../../src/api/axios';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    width: '80%',
  },
});

export default function CompleteTaskScreen() {
  const { taskId } = useLocalSearchParams();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { isLoaded, isSignedIn } = useAuth(); // 👈 SOLO esto
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso para acceder a tus fotos',
          'Usamos tu galería para que puedas seleccionar una imagen como evidencia al completar una tarea del hogar. Por ejemplo, puedes subir una foto de la cocina limpia después de terminar la tarea.'
        );
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      console.log('📸 Imagen seleccionada:', asset);
      setImage(asset.uri);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Falta imagen', 'Selecciona una imagen');
      return;
    }

    if (!isLoaded || !isSignedIn) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    try {
      setUploading(true);

      // 1️⃣ Subir imagen
     const fileName = image.split('/').pop() || `evidencia-${Date.now()}.jpg`;
      const extension = fileName.split('.').pop()?.toLowerCase();

      let mimeType = 'image/jpeg';

      if (extension === 'png') mimeType = 'image/png';
      if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
      if (extension === 'webp') mimeType = 'image/webp';
      if (extension === 'heic' || extension === 'heif') mimeType = 'image/heic';

      const safeFileName =
        extension && ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(extension)
          ? fileName
          : `evidencia-${Date.now()}.jpg`;

      const formData = new FormData();

      formData.append('image', {
        uri: image,
        name: safeFileName,
        type: mimeType,
      } as any);

      const uploadRes = await API.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = uploadRes.data.url;

      // 2️⃣ Marcar tarea como completada (SIN headers manuales)
      await API.post(`/history/${taskId}/complete`, {
        photoUrl: imageUrl,
      });

      Alert.alert('✅ Tarea registrada');
      router.replace('/tasks');
    } catch (err) {
      console.error('Error al completar tarea:', err);
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