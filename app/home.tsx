import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AuthContext } from '../src/context/AuthContext';
import Colors from '../src/constants/Colors';
import API from '../src/api/axios';
import { SafeAreaView } from 'react-native-safe-area-context';

type Home = {
  _id: string;
  name: string;
  createdAt: string;
  // agrega aquí otras propiedades si las hay
};

export default function HomeScreen() {
  const router = useRouter();
  const { token } = useContext(AuthContext);
  const [homes, setHomes] = useState<Home[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomes = async () => {
      try {
        const res = await API.get('/home/mis-hogares', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHomes(res.data.homes);
      } catch (err) {
        console.error('Error al cargar hogares:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomes();
  }, []);

  const handleCreateHome = () => {
    router.push('/home-setup'); // o directamente abrir un modal si lo prefieres
  };

  const renderItem = ({ item }: any) => (
    <Card style={styles.card}>
      <Card.Title title={`🏡 ${item.name}`} subtitle={`Miembro desde: ${new Date(item.createdAt).toLocaleDateString()}`} />
      <Card.Actions>
        <Button onPress={() => router.push(`/tasks?homeId=${item._id}`)}>Ver tareas</Button>

        <Button
          mode="outlined"
          onPress={() => router.push('/history')}
        >
        Ver historial
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return <ActivityIndicator animating color={Colors.button} style={{ marginTop: 50 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Hola Kevin! 👋</Text>
      <Text style={styles.subtitle}>Tus hogares activos:</Text>

      {homes.length < 5 && (
        <Card style={[styles.card, styles.createCard]} onPress={handleCreateHome}>
          <Card.Title title="➕ Crear nuevo hogar" />
        </Card>
      )}

      <FlatList
        data={homes}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 5,
    color: Colors.textDark,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 15,
    color: Colors.textDark,
  },
  card: {
    marginBottom: 15,
    backgroundColor: Colors.background,
  },
  createCard: {
    borderStyle: 'dashed',
    borderColor: Colors.grayMedium,
    borderWidth: 1,
  },
});
