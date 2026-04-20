import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import Wheel from 'react-native-spin-the-wheel';
import { useRouter } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { useTheme } from '../../src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../../src/api/axios';
import { AuthContext } from '../../src/context/AuthContext';

export default function RuletteScreen() {
  const [winner, setWinner] = useState('');
  const [members, setMembers] = useState<{ text: string }[]>([]);
  const { token } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <IconButton
          icon="arrow-left"
          iconColor={colors.textPrimary}
          size={24}
          onPress={() => router.back()}
        />
        <Text style={[styles.title, { color: colors.textPrimary }]}>🎯 Ruleta de Selección</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.wheelContainer}>
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
          <Text style={[styles.result, { color: colors.textPrimary }]}>
            🎉 El integrante seleccionado es: {winner} 🎉
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  wheelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  result: {
    marginTop: 30,
    fontSize: 16,
    textAlign: 'center',
  },
});
