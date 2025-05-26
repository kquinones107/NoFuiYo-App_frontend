import React, { useState, useContext, useEffect } from 'react';
import { View, Image, StyleSheet, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthContext } from '../../src/context/AuthContext';
import Colors from '../../src/constants/Colors';
import axios from 'axios';

export default function CompleteTaskScreen() {
  const { taskId } = useLocalSearchParams();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { token } = useContext(AuthContext);
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

      // 1. Convertir imagen a FormData
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        name: 'evidencia.jpg',
        type: 'image/jpeg',
      } as any);

      // 2. Subir imagen
      const uploadRes = await axios.post('https://nofuiyoapp-backend.onrender.com/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = uploadRes.data.url;

      // 3. Completar tarea
      await axios.post(
        `https://nofuiyoapp-backend.onrender.com/api/history/${taskId}/complete`,
        { photoUrl: imageUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('✅ Tarea registrada');
      router.replace('/tasks'); // Redirigir a la lista de tareas
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo completar la tarea');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Completar Tarea
      </Text>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <Button
        icon="image"
        mode="outlined"
        onPress={pickImage}
        style={styles.button}
        textColor={Colors.buttonText}
      >
        Subir Imagen 📸
      </Button>

      <Button
        icon="check"
        mode="contained"
        onPress={handleSubmit}
        disabled={!image || uploading}
        loading={uploading}
        style={styles.button}
        textColor={!image ? '#000' : Colors.buttonText}
      >
        Marcar como Hecha
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
    color: Colors.textDark,
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
    backgroundColor: Colors.button,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 20,
  },
});
