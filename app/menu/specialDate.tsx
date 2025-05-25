import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, TextInput, Button, IconButton } from 'react-native-paper';
import Colors from '../../src/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SpecialDatesScreen() {
  const [dates, setDates] = useState([
    { title: 'Cumpleaños Kevin', date: '2025-06-20' },
    { title: 'Día de la Madre', date: '2025-05-11' },
    { title: 'Amor y Amistad', date: '2025-09-20' },
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const addDate = () => {
    if (!newTitle.trim()) return;
    const iso = newDate.toISOString().split('T')[0];
    setDates([...dates, { title: newTitle, date: iso }]);
    setNewTitle('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>🎉 Fechas Especiales del Hogar</Text>

        {dates.map((item, index) => (
          <Card key={index} style={styles.card}>
            <Card.Title title={item.title} subtitle={`📅 ${item.date}`} />
          </Card>
        ))}

        <TextInput
          label="Título de la fecha"
          value={newTitle}
          onChangeText={setNewTitle}
          style={styles.input}
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
          <Text style={styles.dateText}>{newDate.toDateString()}</Text>
        </View>

        {showPicker && (
          <DateTimePicker
            value={newDate}
            mode="date"
            display="default"
            onChange={(e, selected) => {
              const currentDate = selected || newDate;
              setShowPicker(false);
              setNewDate(currentDate);
            }}
          />
        )}

        <Button mode="contained" onPress={addDate} style={styles.button}>
          Agregar Fecha Especial
        </Button>
      </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    marginBottom: 10,
  },
  button: {
    backgroundColor: Colors.button,
    marginTop: 15,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    marginLeft: 10,
    color: Colors.textDark,
  },
  dateButton: {
    flexGrow: 1,
  },
});
