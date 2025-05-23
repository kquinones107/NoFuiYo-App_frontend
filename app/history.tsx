import React, { useEffect, useState, useContext } from 'react';
import { View, Image, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Avatar, ActivityIndicator, Button } from 'react-native-paper';
import { AuthContext } from '../src/context/AuthContext';
import API from '../src/api/axios';
import Colors from '../src/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HistoryItem {
  _id: string;
  task: { name: string };
  doneBy: { name: string };
  doneAt: string;
  photoUrl: string;
  createdAt: string;
  late: boolean;
}

export default function HistoryScreen() {
  const { token } = useContext(AuthContext);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'late' | 'ontime'>('all');

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
  const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};
const filteredData = history.filter((item) => {
  if (filter === 'all') return true;
  if (filter === 'late') return item.late === true;
  if (filter === 'ontime') return item.late === false;
});

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Card style={styles.card}>
  <Card.Title
    title={item.task.name}
    subtitle={`Hecha por: ${item.doneBy.name} el ${formatDate(item.doneAt)}`}
    left={(props) => (
      <Avatar.Icon
        {...props}
        icon={item.late ? 'alert-circle-outline' : 'check-circle-outline'}
        style={{
          backgroundColor: item.late ? '#ffcdd2' : '#c8e6c9', // rojo claro o verde claro
        }}
      />
    )}
  />
  {item.photoUrl && (
    <Card.Cover source={{ uri: item.photoUrl }} style={{ marginTop: 8 }} />
  )}
</Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>📋 Historial de Tareas</Text>

{loading ? (
  <ActivityIndicator animating color={Colors.button} />
) : (
  <>
    <View style={styles.filterRow}>
      <Button
        mode={filter === 'all' ? 'contained' : 'outlined'}
        onPress={() => setFilter('all')}
        style={styles.filterButton}
      >
        Todas
      </Button>
      <Button
        mode={filter === 'ontime' ? 'contained' : 'outlined'}
        onPress={() => setFilter('ontime')}
        style={styles.filterButton}
      >
        A tiempo
      </Button>
      <Button
        mode={filter === 'late' ? 'contained' : 'outlined'}
        onPress={() => setFilter('late')}
        style={styles.filterButton}
      >
        Tarde
      </Button>
    </View>

    <FlatList
      data={filteredData}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
    />
  </>
)}
    </SafeAreaView>
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
  filterRow: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginBottom: 15,
},
filterButton: {
  flex: 1,
  marginHorizontal: 5,
},
});
