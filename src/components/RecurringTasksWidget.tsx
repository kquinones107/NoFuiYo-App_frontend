import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { getColors } from '../constants/Colors';
import {
  formatCountdownSpanish,
  getCycleState,
  recurrenceLabel,
} from '../lib/recurringSchedule';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type WidgetTask = {
  _id: string;
  name: string;
  dueDate: string;
  frequency?: string;
  customIntervalDays?: number | null;
};

type AppColors = ReturnType<typeof getColors>;

type Props = {
  tasks: WidgetTask[];
  colors: AppColors;
};

const RING_SIZE = 92;
const STROKE = 7;
const R = (RING_SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function TaskProgressRing({
  progress,
  activeColor,
  trackColor,
}: {
  progress: number;
  activeColor: string;
  trackColor: string;
}) {
  const p = useSharedValue(progress);

  useEffect(() => {
    p.value = withTiming(progress, { duration: 550 });
  }, [progress, p]);

  const animatedProps = useAnimatedProps(() => {
    const offset = CIRC * (1 - p.value);
    return { strokeDashoffset: offset };
  });

  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;

  return (
    <View style={styles.ringWrap}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <G transform={`rotate(-90 ${cx} ${cy})`}>
          <Circle
            cx={cx}
            cy={cy}
            r={R}
            stroke={trackColor}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={R}
            stroke={activeColor}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRC}, ${CIRC}`}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
    </View>
  );
}

export function RecurringTasksWidget({ tasks, colors }: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const itemWidth = useMemo(() => Math.min(168, Math.max(148, width * 0.42)), [width]);

  const renderItem: ListRenderItem<WidgetTask> = ({ item }) => {
    const due = new Date(item.dueDate);
    const { progress, remainingMs, isOverdue } = getCycleState(
      due,
      now,
      item.frequency,
      item.customIntervalDays
    );
    const countdown = formatCountdownSpanish(remainingMs, isOverdue);
    const recur = recurrenceLabel(item.frequency, item.customIntervalDays);
    const activeColor = isOverdue ? colors.error : colors.accent;
    const trackColor = colors.surfaceVariant;

    return (
      <Pressable
        onPress={() => router.push(`/complete/${item._id}` as const)}
        style={({ pressed }) => [
          styles.card,
          {
            width: itemWidth,
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={styles.cardInner}>
          <TaskProgressRing
            progress={progress}
            activeColor={activeColor}
            trackColor={trackColor}
          />
          <View style={styles.cardText}>
            <Text
              numberOfLines={2}
              style={[styles.taskName, { color: colors.textPrimary }]}
            >
              {item.name}
            </Text>
            <View style={[styles.badge, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{recur}</Text>
            </View>
            <Text style={[styles.countdown, { color: isOverdue ? colors.error : colors.textSecondary }]}>
              {isOverdue ? 'Requiere acción' : `Próxima: ${countdown}`}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  if (!tasks.length) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin tareas activas</Text>
        <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
          Las tareas recurrentes aparecerán aquí con el progreso hasta la próxima fecha límite.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listWrap}>
      <FlatList
        horizontal
        data={tasks}
        keyExtractor={(t) => t._id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    marginHorizontal: -4,
  },
  row: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 6,
  },
  taskName: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  countdown: {
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    lineHeight: 20,
  },
});
