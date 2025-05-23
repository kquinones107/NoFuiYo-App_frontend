import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import API from '../../src/api/axios';
import { AuthContext } from '../../src/context/AuthContext';
import Colors from '../../src/constants/Colors';

export default function AssignTaskScreen() {
  const { token } = useContext(AuthContext);
  const router = useRouter();

  const [name, setName] = useState('');
  type Member = { _id: string; name: string };
  const [members, setMembers] = useState<Member[]>([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.get('/home/members', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(res.data.members);
      } catch (err) {
        console.error('Error al cargar miembros del hogar', err);
        Alert.alert('Error', 'No se pudo cargar los miembros del hogar');
      }
    };

    fetchMembers();
  }, []);

  const assignTask = async () => {
    if (!name.trim() || !assignedTo) {
      return Alert.alert('Campos requeridos', 'Debes escribir un nombre y seleccionar responsable');
    }

    try {
      setLoading(true);
      await API.post(
        '/tasks',
        { name, assignedTo, dueDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Tarea asignada exitosamente');
      router.replace('/tasks');
    } catch (err) {
      console.error('Error al asignar tarea', err);
      Alert.alert('Error', 'No se pudo asignar la tarea');
    } finally {
      setLoading(false);
    }
  };
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDueDate(selectedDate);
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>📝 Asignar nueva tarea</Text>

      <TextInput
        label="Nombre de la tarea"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
      />

      <Text style={styles.label}>Asignar a</Text>
      <View style={[styles.input, { paddingHorizontal: 0, paddingVertical: 0 }]}>
        <Picker
          selectedValue={assignedTo}
          onValueChange={setAssignedTo}
          style={{ backgroundColor: Colors.inputBackground }}
        >
          <Picker.Item label="Selecciona un miembro" value="" />
          {members.map((m) => (
            <Picker.Item key={m._id} label={m.name} value={m._id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Fecha límite</Text>
      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        {dueDate.toLocaleDateString()}
      </Button>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
          minimumDate={new Date()}
        />
      )}

      <Button
        mode="contained"
        onPress={assignTask}
        loading={loading}
        disabled={!name || !assignedTo || loading}
        style={styles.button}
      >
        Asignar tarea
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
    marginBottom: 20,
    color: Colors.textDark,
  },
  input: {
    marginBottom: 15,
    backgroundColor: Colors.inputBackground,
  },
  label: {
    marginBottom: 5,
    color: Colors.textDark,
  },
  dateButton: {
    marginBottom: 15,
  },
  button: {
    backgroundColor: Colors.button,
  },
});