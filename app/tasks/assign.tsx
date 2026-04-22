import { useAuth } from '@clerk/clerk-expo';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import API from '../../src/api/axios';
import { useTheme } from '../../src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type Member = {
  _id: string;
  name: string;
};

export default function AssignTaskScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [customIntervalDays, setCustomIntervalDays] = useState('7');

  useEffect(() => {
    const fetchMembers = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        const res = await API.get('/home/members');

        console.log('✅ Respuesta /home/members:', res.data);
        console.log('👥 Miembros:', res.data.members);

        setMembers(res.data.members ?? []);
      } catch (err) {
        console.error('❌ Error al cargar miembros del hogar', err);
        Alert.alert('Error', 'No se pudo cargar los miembros del hogar');
      }
    };

    fetchMembers();
  }, [isLoaded, isSignedIn]);

  const assignTask = async () => {
    if (!isLoaded || !isSignedIn) return;

    if (!name.trim() || !assignedTo) {
      return Alert.alert('Campos requeridos', 'Debes escribir un nombre y seleccionar responsable');
    }

    try {
      setLoading(true);

      const body: Record<string, unknown> = {
        name,
        assignedTo,
        dueDate: dueDate.toISOString(),
        frequency,
      };

      if (frequency === 'custom') {
        const n = parseInt(customIntervalDays, 10);
        if (!Number.isFinite(n) || n < 1 || n > 365) {
          Alert.alert('Intervalo inválido', 'Indica un número de días entre 1 y 365');
          setLoading(false);
          return;
        }
        body.customIntervalDays = n;
      }

      await API.post('/tasks', body);

      Alert.alert('Tarea asignada exitosamente');
      router.replace('/tasks');
    } catch (err) {
      console.error('❌ Error al asignar tarea', err);
      Alert.alert('Error', 'No se pudo asignar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDueDate(selectedDate);
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
          📝 Asignar nueva tarea
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.form}>
        <TextInput
          label="Nombre de la tarea"
          value={name}
          onChangeText={setName}
          style={[styles.input, { backgroundColor: colors.inputBackground }]}
          mode="outlined"
        />

        <Text style={[styles.label, { color: colors.textPrimary }]}>Asignar a</Text>
        <View
          style={[
            styles.pickerWrapper,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <Picker
            selectedValue={assignedTo}
            onValueChange={(value) => setAssignedTo(value)}
            style={{ color: colors.textPrimary }}
            dropdownIconColor={colors.textPrimary}
          >
            <Picker.Item
              label={members.length === 0 ? 'No hay miembros disponibles' : 'Selecciona un miembro'}
              value=""
              color={colors.textSecondary}
            />
            {members.map((m) => (
              <Picker.Item
                key={m._id}
                label={m.name?.trim() ? m.name : 'Usuario sin nombre'}
                value={m._id}
                color={colors.textPrimary}
              />
            ))}
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.textPrimary }]}>Recurrencia</Text>
        <View
          style={[
            styles.pickerWrapper,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <Picker
            selectedValue={frequency}
            onValueChange={(v) => setFrequency(v as typeof frequency)}
            style={{ color: colors.textPrimary }}
            dropdownIconColor={colors.textPrimary}
          >
            <Picker.Item label="Diaria" value="daily" color={colors.textPrimary} />
            <Picker.Item label="Semanal" value="weekly" color={colors.textPrimary} />
            <Picker.Item label="Mensual" value="monthly" color={colors.textPrimary} />
            <Picker.Item
              label="Personalizada (cada N días)"
              value="custom"
              color={colors.textPrimary}
            />
          </Picker>
        </View>

        {frequency === 'custom' && (
          <>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Cada cuántos días</Text>
            <TextInput
              value={customIntervalDays}
              onChangeText={setCustomIntervalDays}
              keyboardType="number-pad"
              style={[styles.input, { backgroundColor: colors.inputBackground }]}
              mode="outlined"
              placeholder="7"
            />
          </>
        )}

        <Text style={[styles.label, { color: colors.textPrimary }]}>Fecha límite</Text>
        <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
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
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          Asignar tarea
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  dateButton: {
    marginBottom: 15,
  },
  button: {
    marginTop: 8,
  },
});