import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Card, Chip, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';

import API from '../src/api/axios';
import { useTheme } from '../src/context/ThemeContext';

const { width } = Dimensions.get('window');

interface HistoryItem {
  _id: string;
  task: { name: string } | null;
  doneBy: { name: string } | null;
  doneAt: string;
  photoUrl: string;
  createdAt: string;
  late: boolean;
}

export default function HistoryScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'late' | 'ontime'>('all');

  const fetchHistory = async () => {
    if (!isLoaded || !isSignedIn) return;

    try {
      setLoading(true);
      const res = await API.get('/history');
      setHistory((res.data.history ?? []).filter((item: HistoryItem) => item.task));
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
    return true;
  });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchHistory();
    }
  }, [isLoaded, isSignedIn]);

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Card style={[styles.card, { backgroundColor: colors.backgroundSecondary }]} elevation={2}>
      <Card.Title
        title={item.task?.name || 'Tarea eliminada'}
        titleStyle={[styles.taskTitle, { color: colors.textPrimary }]}
        subtitle={`Hecha por: ${item.doneBy?.name || 'Usuario eliminado'} el ${formatDate(item.doneAt)}`}
        subtitleStyle={[styles.taskSubtitle, { color: colors.textSecondary }]}
        left={(props) => (
          <Avatar.Icon
            {...props}
            icon={item.late ? 'alert-circle-outline' : 'check-circle-outline'}
            style={[
              styles.avatar,
              { backgroundColor: item.late ? colors.error : colors.success },
            ]}
          />
        )}
        right={() => (
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                { color: item.late ? colors.error : colors.success },
              ]}
            >
              {item.late ? 'Tarde' : 'A tiempo'}
            </Text>
          </View>
        )}
      />
      {item.photoUrl && (
        <Card.Cover source={{ uri: item.photoUrl }} style={styles.taskImage} />
      )}
    </Card>
  );

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando historial...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <IconButton
          icon="arrow-left"
          iconColor="#FFFFFF"
          size={24}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text variant="headlineMedium" style={styles.title}>
          📋 Historial de Tareas
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Revisa todas las tareas completadas
        </Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando historial...
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.filterContainer}>
            <Chip
              selected={filter === 'all'}
              onPress={() => setFilter('all')}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    filter === 'all' ? colors.primary : colors.surfaceVariant,
                },
              ]}
              textStyle={{
                color: filter === 'all' ? '#FFFFFF' : colors.textPrimary,
                fontWeight: filter === 'all' ? '600' : '400',
              }}
            >
              Todas
            </Chip>

            <Chip
              selected={filter === 'ontime'}
              onPress={() => setFilter('ontime')}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    filter === 'ontime' ? colors.primary : colors.surfaceVariant,
                },
              ]}
              textStyle={{
                color: filter === 'ontime' ? '#FFFFFF' : colors.textPrimary,
                fontWeight: filter === 'ontime' ? '600' : '400',
              }}
            >
              A tiempo
            </Chip>

            <Chip
              selected={filter === 'late'}
              onPress={() => setFilter('late')}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    filter === 'late' ? colors.primary : colors.surfaceVariant,
                },
              ]}
              textStyle={{
                color: filter === 'late' ? '#FFFFFF' : colors.textPrimary,
                fontWeight: filter === 'late' ? '600' : '400',
              }}
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
  },
  header: {
    paddingTop: 8,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -8,
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFFFFF',
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
    borderColor: 'transparent',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskSubtitle: {
    fontSize: 14,
  },
  avatar: {},
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