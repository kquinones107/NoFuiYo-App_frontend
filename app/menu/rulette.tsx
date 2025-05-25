import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import Wheel from 'react-native-spin-the-wheel';
import Colors from '../../src/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../../src/api/axios';
import { AuthContext } from '../../src/context/AuthContext';

export default function RuletteScreen() {
  const [winner, setWinner] = useState('');
  const [members, setMembers] = useState<{ text: string }[]>([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.get('/home/members', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const formatted = res.data.members.map((m: any) => ({ text: m.name }));
        setMembers(formatted);
      } catch (err) {
        console.error('Error al cargar miembros del hogar', err);
        Alert.alert('Error', 'No se pudo cargar los miembros del hogar');
      }
    };

    fetchMembers();
  }, []);

  const handleFinish = (segment: { text: string }) => {
    setWinner(segment.text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🎯 Ruleta de Selección</Text>

      {members.length > 0 && (
        <Wheel
          segments={members}
          segColors={['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa']}
          textColors={['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']}
          upDuration={4000}
          onFinished={handleFinish}
          pinImage={require('../../assets/pin.png')}
        />
      )}

      {winner !== '' && (
        <Text style={styles.result}>🎉 El integrante seleccionado es: {winner} 🎉</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 20,
  },
  result: {
    marginTop: 30,
    fontSize: 16,
    color: Colors.textDark,
    textAlign: 'center',
  },
});
