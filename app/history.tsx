import React, { useEffect, useState, useContext } from 'react';
import { View, Image, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Avatar, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../src/context/AuthContext';
import API from '../src/api/axios';
import Colors from '../src/constants/Colors';

interface HistoryItem {
  _id: string;
  task: { name: string };
  doneBy: { name: string };
  photoUrl: string;
  createdAt: string;
}

export default function HistoryScreen() {
  const { token } = useContext(AuthContext);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await API.get('/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.history);
    } catch (err) {
      console.error('Error al cargar historial', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.task.name}
        subtitle={`Hecha por: ${item.doneBy.name} el ${new Date(item.createdAt).toLocaleDateString()}`}
        left={(props) => <Avatar.Icon {...props} icon="history" />}
      />
      {item.photoUrl && (
        <Image source={{ uri: item.photoUrl }} style={styles.image} />
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>📋 Historial de Tareas</Text>

      {loading ? (
        <ActivityIndicator animating color={Colors.button} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 15,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.textDark,
  },
  card: {
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});
