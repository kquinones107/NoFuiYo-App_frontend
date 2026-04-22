import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, TextInput, Button, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@clerk/clerk-expo';

import API from '../../src/api/axios';

type SpecialDate = {
  title: string;
  date: string;
};

export default function SpecialDatesScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [dates, setDates] = useState<SpecialDate[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const fetchDates = async () => {
    if (!isLoaded || !isSignedIn) return;

    try {
      const res = await API.get('/dates');
      setDates(res.data.dates ?? []);
    } catch (err) {
      console.error('Error al cargar fechas', err);
      Alert.alert('Error', 'No se pudieron cargar las fechas especiales');
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchDates();
    }
  }, [isLoaded, isSignedIn]);

  const addDate = async () => {
    if (!isLoaded || !isSignedIn) return;
    if (!newTitle.trim()) return;

    const iso = newDate.toISOString().split('T')[0];

    try {
      const res = await API.post('/dates', {
        title: newTitle,
        date: iso,
      });

      setDates([...dates, res.data.date]);
      setNewTitle('');
    } catch (err) {
      console.error('Error al agregar fecha', err);
      Alert.alert('Error', 'No se pudo guardar la nueva fecha');
    }
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textPrimary }}>Cargando fechas especiales...</Text>
        </View>
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
        <Text style={[styles.title, { color: colors.textPrimary }]}>🎉 Fechas Especiales</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView>
        {dates.map((item, index) => (
          <Card key={index} style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <Card.Title
              title={item.title}
              titleStyle={{ color: colors.textPrimary }}
              subtitle={`📅 ${item.date}`}
              subtitleStyle={{ color: colors.textSecondary }}
            />
          </Card>
        ))}

        <TextInput
          label="Título de la fecha"
          value={newTitle}
          onChangeText={setNewTitle}
          style={[styles.input, { backgroundColor: colors.inputBackground }]}
          mode="outlined"
        />

        <View style={styles.dateRow}>
          <Button
            mode="outlined"
            onPress={() => setShowPicker(true)}
            style={styles.dateButton}
          >
            Seleccionar fecha
          </Button>
          <Text style={[styles.dateText, { color: colors.textPrimary }]}>
            {newDate.toDateString()}
          </Text>
        </View>

        {showPicker && (
          <DateTimePicker
            value={newDate}
            mode="date"
            display="default"
            onChange={(_e, selected) => {
              const currentDate = selected || newDate;
              setShowPicker(false);
              setNewDate(currentDate);
            }}
          />
        )}

        <Button
          mode="contained"
          onPress={addDate}
          style={[styles.button, { backgroundColor: colors.primary }]}
          disabled={!isLoaded || !isSignedIn}
        >
          Agregar Fecha Especial
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: -8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  card: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 15,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    marginLeft: 10,
  },
  dateButton: {
    flexGrow: 1,
  },
});