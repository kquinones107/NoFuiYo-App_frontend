import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Button, Card, IconButton, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import API from '../../src/api/axios';
import { useTheme } from '../../src/context/ThemeContext';

type HomeResult = {
  _id: string;
  name: string;
  code: string;
};

type NeighborRequest = {
  _id: string;
  fromHome: {
    _id: string;
    name: string;
    code: string;
  };
};

export default function NeighborsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [code, setCode] = useState('');
  const [foundHome, setFoundHome] = useState<HomeResult | null>(null);
  const [requests, setRequests] = useState<NeighborRequest[]>([]);
  const [neighbors, setNeighbors] = useState<HomeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [requestsRes, neighborsRes] = await Promise.allSettled([
        API.get('/neighbors/requests'),
        API.get('/neighbors'),
      ]);

      if (requestsRes.status === 'fulfilled') {
        setRequests(requestsRes.value.data.requests ?? []);
      }

      if (neighborsRes.status === 'fulfilled') {
        setNeighbors(neighborsRes.value.data.neighbors ?? []);
      }
    } catch (err) {
      console.error('Error al cargar vecinos:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchHome = async () => {
    if (!code.trim()) {
      return Alert.alert('Código requerido', 'Ingresa el código del hogar vecino');
    }

    try {
      setSearching(true);
      setFoundHome(null);

      const res = await API.get(`/neighbors/search/${encodeURIComponent(code.trim())}`);
      setFoundHome(res.data.home);
    } catch (err: any) {
      console.error('Error al buscar hogar:', err?.response?.data || err);
      Alert.alert(
        'Aviso',
        err?.response?.data?.message || 'No se encontró el hogar'
      );
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async () => {
    if (!code.trim()) {
      return Alert.alert('Código requerido', 'Ingresa el código del hogar vecino');
    }

    try {
      setSearching(true);

      const res = await API.post('/neighbors/request', {
        code: code.trim(),
      });

      Alert.alert('Solicitud enviada', res.data.message || 'Solicitud enviada correctamente');
      setCode('');
      setFoundHome(null);
      await fetchData();
    } catch (err: any) {
      console.error('Error al enviar solicitud:', err?.response?.data || err);
      Alert.alert(
        'Aviso',
        err?.response?.data?.message || 'No se pudo enviar la solicitud'
      );
    } finally {
      setSearching(false);
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      await API.post(`/neighbors/requests/${requestId}/accept`, {});
      Alert.alert('Listo', 'Ahora son hogares vecinos');
      await fetchData();
    } catch (err: any) {
      console.error('Error al aceptar solicitud:', err?.response?.data || err);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'No se pudo aceptar la solicitud'
      );
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await API.post(`/neighbors/requests/${requestId}/reject`, {});
      Alert.alert('Solicitud rechazada');
      await fetchData();
    } catch (err: any) {
      console.error('Error al rechazar solicitud:', err?.response?.data || err);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'No se pudo rechazar la solicitud'
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={colors.textPrimary}
          onPress={() => router.back()}
        />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          🏘️ Hogares vecinos
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={[]}
        keyExtractor={(_, index) => String(index)}
        renderItem={null}
        ListHeaderComponent={
          <>
            <Card style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Buscar hogar vecino
                </Text>

                <Text style={[styles.description, { color: colors.textSecondary }]}>
                  Ingresa el código del hogar que quieres agregar como vecino.
                </Text>

                <TextInput
                  label="Código del hogar"
                  value={code}
                  onChangeText={(value) => setCode(value.toUpperCase())}
                  mode="outlined"
                  autoCapitalize="characters"
                  style={[styles.input, { backgroundColor: colors.inputBackground }]}
                />

                <View style={styles.actionsRow}>
                  <Button
                    mode="outlined"
                    onPress={searchHome}
                    loading={searching}
                    disabled={searching}
                    style={styles.actionButton}
                  >
                    Buscar
                  </Button>

                  <Button
                    mode="contained"
                    onPress={sendRequest}
                    loading={searching}
                    disabled={searching}
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  >
                    Enviar solicitud
                  </Button>
                </View>

                {foundHome && (
                  <Card style={[styles.resultCard, { backgroundColor: colors.cardBackground }]}>
                    <Card.Content>
                      <Text style={[styles.homeName, { color: colors.textPrimary }]}>
                        🏡 {foundHome.name}
                      </Text>
                      <Text style={{ color: colors.textSecondary }}>
                        Código: {foundHome.code}
                      </Text>
                    </Card.Content>
                  </Card>
                )}
              </Card.Content>
            </Card>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                📬 Solicitudes recibidas
              </Text>

              {loading ? (
                <ActivityIndicator animating color={colors.primary} />
              ) : requests.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No tienes solicitudes pendientes.
                </Text>
              ) : (
                requests.map((item) => (
                  <Card
                    key={item._id}
                    style={[styles.cardSmall, { backgroundColor: colors.backgroundSecondary }]}
                  >
                    <Card.Content>
                      <Text style={[styles.homeName, { color: colors.textPrimary }]}>
                        🏠 {item.fromHome?.name || 'Hogar sin nombre'}
                      </Text>
                      <Text style={{ color: colors.textSecondary }}>
                        Código: {item.fromHome?.code}
                      </Text>

                      <View style={styles.actionsRow}>
                        <Button
                          mode="contained"
                          onPress={() => acceptRequest(item._id)}
                          style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        >
                          Aceptar
                        </Button>

                        <Button
                          mode="outlined"
                          onPress={() => rejectRequest(item._id)}
                          style={styles.actionButton}
                        >
                          Rechazar
                        </Button>
                      </View>
                    </Card.Content>
                  </Card>
                ))
              )}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                🏘️ Mis hogares vecinos
              </Text>

              {loading ? (
                <ActivityIndicator animating color={colors.primary} />
              ) : neighbors.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Aún no tienes hogares vecinos.
                </Text>
              ) : (
                neighbors.map((item) => (
                  <Card
                    key={item._id}
                    style={[styles.cardSmall, { backgroundColor: colors.backgroundSecondary }]}
                  >
                    <Card.Content>
                      <Text style={[styles.homeName, { color: colors.textPrimary }]}>
                        🏡 {item.name}
                      </Text>
                      <Text style={{ color: colors.textSecondary }}>
                        Código: {item.code}
                      </Text>
                    </Card.Content>
                  </Card>
                ))
              )}
            </View>
          </>
        }
      />
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
    marginBottom: 12,
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
    borderRadius: 16,
    marginBottom: 18,
  },
  cardSmall: {
    borderRadius: 14,
    marginBottom: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    marginBottom: 14,
    lineHeight: 20,
  },
  input: {
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
  },
  resultCard: {
    marginTop: 14,
    borderRadius: 12,
  },
  homeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 4,
  },
});