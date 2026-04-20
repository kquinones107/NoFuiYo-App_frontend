export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Length of one recurrence window for progress visualization. */
export function getIntervalMs(frequency: string | undefined, customIntervalDays?: number | null): number {
  switch (frequency) {
    case 'daily':
      return MS_PER_DAY;
    case 'weekly':
      return 7 * MS_PER_DAY;
    case 'monthly':
      return 30 * MS_PER_DAY;
    case 'custom': {
      const days = customIntervalDays ?? 7;
      const clamped = Math.min(365, Math.max(1, days));
      return clamped * MS_PER_DAY;
    }
    default:
      return 7 * MS_PER_DAY;
  }
}

export type CycleState = {
  /** 0 = start of urgency window, 1 = due or overdue (ring full). */
  progress: number;
  remainingMs: number;
  isOverdue: boolean;
};

/**
 * Progress fills as the due date approaches within one recurrence interval.
 * If the due date is farther than one interval away, progress stays at 0.
 */
export function getCycleState(
  dueDate: Date,
  now: Date,
  frequency: string | undefined,
  customIntervalDays?: number | null
): CycleState {
  const intervalMs = getIntervalMs(frequency, customIntervalDays);
  const due = dueDate.getTime();
  const n = now.getTime();
  const remainingMs = due - n;

  if (remainingMs <= 0) {
    return { progress: 1, remainingMs, isOverdue: true };
  }

  if (remainingMs >= intervalMs) {
    return { progress: 0, remainingMs, isOverdue: false };
  }

  return {
    progress: 1 - remainingMs / intervalMs,
    remainingMs,
    isOverdue: false,
  };
}

export function recurrenceLabel(frequency: string | undefined, customIntervalDays?: number | null): string {
  switch (frequency) {
    case 'daily':
      return 'Diaria';
    case 'weekly':
      return 'Semanal';
    case 'monthly':
      return 'Mensual';
    case 'custom': {
      const d = customIntervalDays ?? 7;
      return `Cada ${d} día${d === 1 ? '' : 's'}`;
    }
    default:
      return 'Recurrente';
  }
}

export function formatCountdownSpanish(remainingMs: number, isOverdue: boolean): string {
  if (isOverdue) return 'Vencida';

  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes} min`;
  }
  return '< 1 min';
}
