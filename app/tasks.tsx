import React, { useState, useCallback } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Avatar, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';

import API from '../src/api/axios';
import { recurrenceLabel } from '../src/lib/recurringSchedule';
import { useTheme } from '../src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Task {
  _id: string;
  name: string;
  dueDate: string;
  assignedTo: {
    name: string;
    email: string;
  };
  frequency: string;
  customIntervalDays?: number | null;
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const { isLoaded, isSignedIn } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const fetchTasks = async () => {
    if (!isLoaded || !isSignedIn) return;

    try {
      setLoading(true);
      const res = await API.get('/tasks');
      setTasks(res.data.tasks ?? []);
    } catch (error) {
      console.error('Error al cargar tareas', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isLoaded && isSignedIn) {
        fetchTasks();
      }
    }, [isLoaded, isSignedIn])
  );

  const renderItem = ({ item }: { item: Task }) => {
    const isLate = new Date(item.dueDate) < new Date();

    return (
      <Card style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
        <Card.Title
          title={item.name}
          titleStyle={{ color: colors.textPrimary }}
          subtitle={`Responsable: ${item.assignedTo?.name || 'Sin asignar'}`}
          subtitleStyle={{ color: colors.textSecondary }}
          left={(props) => <Avatar.Icon {...props} icon="checkbox-marked-outline" />}
        />
        <Card.Content>
          <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
            🔁 {recurrenceLabel(item.frequency, item.customIntervalDays)}
          </Text>
          <Text style={{ color: isLate ? colors.error : colors.textPrimary }}>
            📅 Fecha límite: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            onPress={() => router.push(`/complete/${item._id}` as const)}
          >
            Marcar como hecha
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator animating color={colors.primary} style={{ marginTop: 30 }} />
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
        <Text variant="headlineMedium" style={[styles.title, { color: colors.textPrimary }]}>
          🧼 Tus Tareas
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <ActivityIndicator animating color={colors.primary} />
      ) : tasks.length === 0 ? (
        <Text style={[styles.noTasks, { color: colors.textPrimary }]}>
          No tienes tareas asignadas
        </Text>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
        />
      )}

      <Button
        icon="plus"
        mode="outlined"
        onPress={() => router.push('/tasks/assign')}
        style={styles.addButton}
      >
        Asignar nueva tarea
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  card: {
    marginBottom: 15,
  },
  noTasks: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  addButton: {
    marginBottom: 15,
  },
});