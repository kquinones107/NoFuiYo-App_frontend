import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Card, Chip, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../src/api/axios';
import { AuthContext } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import Colors from '../src/constants/Colors';

const { width } = Dimensions.get('window');

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
  const { colors } = useTheme();
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
    <Card style={styles.card} elevation={2}>
      <Card.Title
        title={item.task.name}
        titleStyle={styles.taskTitle}
        subtitle={`Hecha por: ${item.doneBy.name} el ${formatDate(item.doneAt)}`}
        subtitleStyle={styles.taskSubtitle}
        left={(props) => (
          <Avatar.Icon
            {...props}
            icon={item.late ? 'alert-circle-outline' : 'check-circle-outline'}
            style={[
              styles.avatar,
              {
                backgroundColor: item.late ? Colors.error : Colors.success,
              }
            ]}
          />
        )}
        right={() => (
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText,
              { color: item.late ? Colors.error : Colors.success }
            ]}>
              {item.late ? 'Tarde' : 'A tiempo'}
            </Text>
          </View>
        )}
      />
      {item.photoUrl && (
        <Card.Cover 
          source={{ uri: item.photoUrl }} 
          style={styles.taskImage}
        />
      )}
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text variant="headlineMedium" style={styles.title}>📋 Historial de Tareas</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Revisa todas las tareas completadas
        </Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      ) : (
        <>
          {/* Filter chips */}
          <View style={styles.filterContainer}>
            <Chip
              selected={filter === 'all'}
              onPress={() => setFilter('all')}
              style={[styles.chip, filter === 'all' && styles.selectedChip]}
              textStyle={filter === 'all' ? styles.selectedChipText : styles.chipText}
            >
              Todas
            </Chip>
            <Chip
              selected={filter === 'ontime'}
              onPress={() => setFilter('ontime')}
              style={[styles.chip, filter === 'ontime' && styles.selectedChip]}
              textStyle={filter === 'ontime' ? styles.selectedChipText : styles.chipText}
            >
              A tiempo
            </Chip>
            <Chip
              selected={filter === 'late'}
              onPress={() => setFilter('late')}
              style={[styles.chip, filter === 'late' && styles.selectedChip]}
              textStyle={filter === 'late' ? styles.selectedChipText : styles.chipText}
            >
              Vencidas
            </Chip>
          </View>

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
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
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    color: Colors.buttonText,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.buttonText,
    opacity: 0.9,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.textLight,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  chip: {
    backgroundColor: Colors.grayLighter,
    borderColor: Colors.grayLight,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    color: Colors.textDark,
  },
  selectedChipText: {
    color: Colors.buttonText,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  taskSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  avatar: {
    backgroundColor: Colors.primary,
  },
  statusContainer: {
    paddingRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  taskImage: {
    marginTop: 8,
    borderRadius: 8,
  },
});
