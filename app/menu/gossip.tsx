import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Button,
  Card,
  IconButton,
  Text,
  TextInput,
  SegmentedButtons,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import API from '../../src/api/axios';
import { useTheme } from '../../src/context/ThemeContext';

type ReactionEmoji = '😂' | '👀' | '🔥' | '😱' | '🤯';

type Gossip = {
  _id: string;
  content: string;
  createdAt: string;
  expiresAt: string;
  replyCount: number;
  reactions?: Record<ReactionEmoji, number>;
};

export default function GossipScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [gossips, setGossips] = useState<Gossip[]>([]);
  const [content, setContent] = useState('');
  const [durationHours, setDurationHours] = useState<'24' | '36'>('24');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const reactionEmojis: ReactionEmoji[] = [
  '😂',
  '👀',
  '🔥',
  '😱',
  '🤯',
  ];

  const fetchGossips = async () => {
    try {
      setLoading(true);
      const res = await API.get('/gossip');
      setGossips(res.data.gossips ?? []);
    } catch (err: any) {
      console.error('Error al cargar chismecitos:', err?.response?.data || err);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'No se pudieron cargar los chismecitos'
      );
    } finally {
      setLoading(false);
    }
  };

  const publishGossip = async () => {
    if (!content.trim()) {
      return Alert.alert('Chismecito vacío', 'Escribe tu chismecito bomba antes de publicarlo.');
    }

    try {
      setPosting(true);

      const res = await API.post('/gossip', {
        content: content.trim(),
        durationHours: Number(durationHours),
      });

      Alert.alert('Publicado', res.data.message || 'Chismecito publicado');
      setContent('');
      setDurationHours('24');
      await fetchGossips();
    } catch (err: any) {
      console.error('Error al publicar chismecito:', err?.response?.data || err);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'No se pudo publicar el chismecito'
      );
    } finally {
      setPosting(false);
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

  const formatDate = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleString();
  };

  useEffect(() => {
    fetchGossips();
  }, []);

  const reactToGossip = async (
    gossipId: string,
    reaction: ReactionEmoji
  ) => {
    try {
      const res = await API.post(
        `/gossip/${gossipId}/reaction`,
        { reaction }
      );

      setGossips((prev) =>
        prev.map((g) =>
          g._id === gossipId
            ? {
                ...g,
                reactions: res.data.reactions,
              }
            : g
        )
      );
    } catch (err: any) {
      console.error(err);

      Alert.alert(
        'Error',
        err?.response?.data?.message ||
          'No se pudo reaccionar'
      );
    }
  };

  const renderItem = ({ item }: { item: Gossip }) => (
    <Card
      style={[styles.gossipCard, { backgroundColor: colors.backgroundSecondary }]}
      onPress={() =>
        router.push({
          pathname: '/menu/gossipDetail',
          params: { id: item._id },
        })
      }
    >
      <Card.Content>
        <Text style={[styles.anonymousText, { color: colors.primary }]}>
          🕵️ Anónimo dijo:
        </Text>

        <Text style={[styles.gossipContent, { color: colors.textPrimary }]}>
          {item.content}
        </Text>

        <View style={styles.reactionsRow}>
          {reactionEmojis.map((emoji) => (
            <Button
              key={emoji}
              compact
              mode="outlined"
              onPress={() => reactToGossip(item._id, emoji)}
              style={styles.reactionButton}
            >
              {emoji} {item.reactions?.[emoji] ?? 0}
            </Button>
          ))}
        </View>

        <View style={styles.gossipFooter}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            💬 {item.replyCount} respuestas
          </Text>

          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            ⏳ {formatTimeLeft(item.expiresAt)}
          </Text>
        </View>

        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          Publicado: {formatDate(item.createdAt)}
        </Text>
      </Card.Content>
    </Card>
  );

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
          🕵️ Chismecito NoFuiYo
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={gossips}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchGossips}
        ListHeaderComponent={
          <>
            <Card style={[styles.introCard, { backgroundColor: colors.cardBackground }]}>
              <Card.Content>
                <Text style={[styles.introTitle, { color: colors.textPrimary }]}>
                  🔥 Chismecito NoFuiYo
                </Text>

                <Text style={[styles.introPhrase, { color: colors.textSecondary }]}>
                  “Suelta tu chismecito bomba… pero recuerda: NoFuiYo quien lo dijo.”
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.createCard, { backgroundColor: colors.backgroundSecondary }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Publicar chismecito anónimo
                </Text>

                <TextInput
                  label="¿Qué pasó vecino?"
                  value={content}
                  onChangeText={setContent}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  style={[styles.input, { backgroundColor: colors.inputBackground }]}
                />

                <Text style={[styles.counter, { color: colors.textSecondary }]}>
                  {content.length}/500 caracteres
                </Text>

                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  Duración
                </Text>

                <SegmentedButtons
                  value={durationHours}
                  onValueChange={(value) => setDurationHours(value as '24' | '36')}
                  buttons={[
                    { value: '24', label: '24 horas' },
                    { value: '36', label: '36 horas' },
                  ]}
                  style={styles.segmented}
                />

                <Button
                  mode="contained"
                  onPress={publishGossip}
                  loading={posting}
                  disabled={posting}
                  style={[styles.publishButton, { backgroundColor: colors.primary }]}
                >
                  Publicar chismecito
                </Button>
              </Card.Content>
            </Card>

            <Text style={[styles.feedTitle, { color: colors.textPrimary }]}>
              🔥 Chismes recientes
            </Text>

            {loading && (
              <ActivityIndicator animating color={colors.primary} style={{ marginVertical: 20 }} />
            )}

            {!loading && gossips.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Todavía no hay chismecitos activos. Sé el primero en soltar uno 👀
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
  listContent: {
    paddingBottom: 24,
  },
  introCard: {
    borderRadius: 18,
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  introPhrase: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  createCard: {
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
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 16,
  },
  publishButton: {
    borderRadius: 12,
  },
  feedTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  gossipCard: {
    borderRadius: 16,
    marginBottom: 14,
  },
  anonymousText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  gossipContent: {
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 14,
  },
  gossipFooter: {
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
  reactionsRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 12,
},

  reactionButton: {
    borderRadius: 20,
  },
});