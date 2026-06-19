import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Button,
  Card,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import API from '../../src/api/axios';
import { useTheme } from '../../src/context/ThemeContext';

type Gossip = {
  _id: string;
  content: string;
  createdAt: string;
  expiresAt: string;
};

type Reply = {
  _id: string;
  content: string;
  createdAt: string;
};

export default function GossipDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();

  const [gossip, setGossip] = useState<Gossip | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);

  const gossipId = Array.isArray(id) ? id[0] : id;

  const fetchDetail = async () => {
    if (!gossipId) return;

    try {
      setLoading(true);
      const res = await API.get(`/gossip/${gossipId}`);
      setGossip(res.data.gossip);
      setReplies(res.data.replies ?? []);
    } catch (err: any) {
      console.error('Error al cargar chismecito:', err?.response?.data || err);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'No se pudo cargar el chismecito'
      );
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) {
      return Alert.alert('Respuesta vacía', 'Escribe una respuesta antes de enviarla.');
    }

    if (!gossipId) return;

    try {
      setReplying(true);

      const res = await API.post(`/gossip/${gossipId}/reply`, {
        content: replyText.trim(),
      });

      setReplies((prev) => [...prev, res.data.reply]);
      setReplyText('');
    } catch (err: any) {
      console.error('Error al responder:', err?.response?.data || err);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'No se pudo responder el chismecito'
      );
    } finally {
      setReplying(false);
    }
  };

  const formatTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();

    if (diff <= 0) return 'Expirado';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (hours <= 0) return `${minutes} min restantes`;

    return `${hours} h ${minutes} min restantes`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  useEffect(() => {
    fetchDetail();
  }, [gossipId]);

  const renderReply = ({ item, index }: { item: Reply; index: number }) => (
    <Card style={[styles.replyCard, { backgroundColor: colors.backgroundSecondary }]}>
      <Card.Content>
        <Text style={[styles.anonymousText, { color: colors.primary }]}>
          🕵️ Anónimo #{index + 1}
        </Text>

        <Text style={[styles.replyContent, { color: colors.textPrimary }]}>
          {item.content}
        </Text>

        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {formatDate(item.createdAt)}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating color={colors.primary} size="large" />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
            Cargando chismecito...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!gossip) {
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
            Chismecito
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textSecondary }}>
            Este chismecito no existe o ya expiró.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          🕵️ Chismecito
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={replies}
        keyExtractor={(item) => item._id}
        renderItem={renderReply}
        refreshing={loading}
        onRefresh={fetchDetail}
        ListHeaderComponent={
          <>
            <Card style={[styles.gossipCard, { backgroundColor: colors.cardBackground }]}>
              <Card.Content>
                <Text style={[styles.anonymousText, { color: colors.primary }]}>
                  🔥 Anónimo dijo:
                </Text>

                <Text style={[styles.gossipContent, { color: colors.textPrimary }]}>
                  {gossip.content}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    ⏳ {formatTimeLeft(gossip.expiresAt)}
                  </Text>

                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    💬 {replies.length} respuestas
                  </Text>
                </View>

                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  Publicado: {formatDate(gossip.createdAt)}
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.replyFormCard, { backgroundColor: colors.backgroundSecondary }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Responder anónimamente
                </Text>

                <TextInput
                  label="Escribe tu respuesta..."
                  value={replyText}
                  onChangeText={setReplyText}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  maxLength={300}
                  style={[styles.input, { backgroundColor: colors.inputBackground }]}
                />

                <Text style={[styles.counter, { color: colors.textSecondary }]}>
                  {replyText.length}/300 caracteres
                </Text>

                <Button
                  mode="contained"
                  onPress={sendReply}
                  loading={replying}
                  disabled={replying}
                  style={[styles.replyButton, { backgroundColor: colors.primary }]}
                >
                  Responder
                </Button>
              </Card.Content>
            </Card>

            <Text style={[styles.repliesTitle, { color: colors.textPrimary }]}>
              💬 Respuestas anónimas
            </Text>

            {replies.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Todavía no hay respuestas. Sé el primero en meterle candela 👀
              </Text>
            )}
          </>
        }
        contentContainerStyle={styles.listContent}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  gossipCard: {
    borderRadius: 18,
    marginBottom: 16,
  },
  anonymousText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  gossipContent: {
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    flex: 1,
  },
  dateText: {
    fontSize: 11,
  },
  replyFormCard: {
    borderRadius: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 6,
  },
  counter: {
    textAlign: 'right',
    fontSize: 12,
    marginBottom: 12,
  },
  replyButton: {
    borderRadius: 12,
  },
  repliesTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  replyCard: {
    borderRadius: 16,
    marginBottom: 12,
  },
  replyContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 20,
  },
});