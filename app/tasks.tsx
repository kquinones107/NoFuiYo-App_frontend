import React, { useState, useContext, useCallback } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import API from '../src/api/axios';
import { AuthContext } from '../src/context/AuthContext';
import Colors from '../src/constants/Colors';
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
}

export default function TasksScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);
    const router = useRouter();

    const fetchTasks = async () => {
        try {
            const res = await API.get('/tasks', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTasks(res.data.tasks);
        } catch (error) {
            console.error('Error al cargar tareas', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [])
    );

  

  const renderItem = ({ item }: { item: Task }) => {
    const isLate = new Date(item.dueDate) < new Date();
    return (
      <Card style={styles.card}>
        <Card.Title
          title={item.name}
          subtitle={`Responsable: ${item.assignedTo?.name || 'Sin asignar'}`}
          left={(props) => <Avatar.Icon {...props} icon="checkbox-marked-outline" />}
        />
        <Card.Content>
          <Text style={{ color: isLate ? 'red' : Colors.textDark }}>
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
  return (
    <SafeAreaView style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}> 🧼 Tus Tareas</Text>
        

        {loading ? (
            <ActivityIndicator animating color={Colors.button}/>   
        ) : tasks.length === 0 ? (
            <Text style={styles.noTasks}>No tienes tareas asignadas</Text>
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
        style={{ marginBottom: 15 }}
        >
        Asignar nueva tarea
        </Button>
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
  noTasks: {
    textAlign: 'center',
    color: Colors.textDark,
    marginTop: 20,
    fontSize: 16,
  },
});