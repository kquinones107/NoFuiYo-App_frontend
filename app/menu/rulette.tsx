import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Wheel from 'react-native-spin-the-wheel';
import { useRouter } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { useTheme } from '../../src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../../src/api/axios';
import { AuthContext } from '../../src/context/AuthContext';

type MemberSegment = {
  text: string;
};

const WHEEL_COLORS = [
  '#FF6B6B',
  '#4D96FF',
  '#6BCB77',
  '#FFD93D',
  '#A66CFF',
  '#FF8FAB',
  '#00C2A8',
  '#FF922B',
];

export default function RuletteScreen() {
  const [winner, setWinner] = useState('');
  const [members, setMembers] = useState<MemberSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { token } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      setWinner('');

      const res = await API.get('/home/members', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = res.data.members.map((m: any) => ({
        text: m.name,
      }));

      setMembers(formatted);
    } catch (err) {
      console.error('Error al cargar miembros del hogar', err);
      setError('No se pudieron cargar los integrantes del hogar.');
      Alert.alert('Error', 'No se pudieron cargar los integrantes del hogar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const wheelSegments = useMemo(() => {
    if (members.length === 0) return [];

    /*
      Si solo hay un integrante, lo repetimos visualmente para que
      la ruleta pueda dibujarse con varios segmentos de colores.
      El ganador seguirá siendo ese único integrante.
    */
    if (members.length === 1) {
      return Array.from({ length: 6 }, () => ({
        text: members[0].text,
      }));
    }

    /*
      Si hay 2 integrantes, también conviene repetirlos para que
      la ruleta se vea más completa y no tan vacía.
    */
    if (members.length === 2) {
      return [
        members[0],
        members[1],
        members[0],
        members[1],
        members[0],
        members[1],
      ];
    }

    return members;
  }, [members]);

  const segmentColors = useMemo(() => {
    return wheelSegments.map((_, index) => WHEEL_COLORS[index % WHEEL_COLORS.length]);
  }, [wheelSegments]);

  const textColors = useMemo(() => {
    return wheelSegments.map(() => '#FFFFFF');
  }, [wheelSegments]);

  const handleFinish = (segment: MemberSegment) => {
    setWinner(segment.text);
  };

  const wheelSize = Math.min(width * 0.78, 360);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <IconButton
          icon="arrow-left"
          iconColor={colors.textPrimary}
          size={24}
          onPress={() => router.back()}
        />

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          🎯 Ruleta de Selección
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {loading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={colors.textPrimary} />
            <Text style={[styles.stateText, { color: colors.textPrimary }]}>
              Cargando integrantes...
            </Text>
          </View>
        )}

        {!loading && error !== '' && (
          <View style={styles.stateContainer}>
            <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>
              No pudimos cargar la ruleta
            </Text>

            <Text style={[styles.stateText, { color: colors.textPrimary }]}>
              Revisa tu conexión e inténtalo nuevamente.
            </Text>

            <TouchableOpacity style={styles.retryButton} onPress={fetchMembers}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && error === '' && members.length === 0 && (
          <View style={styles.stateContainer}>
            <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>
              Aún no hay integrantes
            </Text>

            <Text style={[styles.stateText, { color: colors.textPrimary }]}>
              Agrega integrantes al hogar para poder usar la ruleta.
            </Text>
          </View>
        )}

        {!loading && error === '' && wheelSegments.length > 0 && (
          <View style={styles.wheelWrapper}>
            <View style={[styles.wheelBox, { width: wheelSize, height: wheelSize }]}>
              <Wheel
                segments={wheelSegments}
                segColors={segmentColors}
                textColors={textColors}
                upDuration={4000}
                onFinished={handleFinish}
                pinImage={require('../../assets/pin-2.png')}
              />
            </View>

            {winner !== '' && (
              <View style={styles.resultCard}>
                <Text style={[styles.resultLabel, { color: colors.textPrimary }]}>
                  Integrante seleccionado
                </Text>

                <Text style={styles.resultName}>
                  🎉 {winner} 🎉
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -8,
    paddingTop: 4,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  wheelWrapper: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  resultCard: {
    width: '100%',
    maxWidth: 360,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.7,
  },
  resultName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  stateContainer: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stateTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  stateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 23,
    opacity: 0.75,
    marginTop: 12,
  },
  retryButton: {
    marginTop: 22,
    backgroundColor: '#111827',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});