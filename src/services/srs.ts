import { SRSState, LearningStatus } from '../types/vocabulary';

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + Math.max(1, Math.round(days)));
  return d.toISOString().split('T')[0];
}

export function createInitialSRSState(): SRSState {
  return {
    repetition: 0,
    interval: 0,
    easeFactor: 2.5,
    lapses: 0,
    nextReviewDate: getTodayDateString(),
  };
}

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm Implementation
 * Calculates new interval, ease factor, repetition count, and next review date.
 */
export function calculateNextSRS(currentState: SRSState, rating: Rating): {
  srs: SRSState;
  newStatus: LearningStatus;
} {
  let { repetition, interval, easeFactor, lapses } = currentState;
  const today = getTodayDateString();

  if (rating === 'again') {
    // Failed recall
    repetition = 0;
    interval = 1;
    lapses += 1;
    easeFactor = Math.max(1.3, easeFactor - 0.20);
  } else if (rating === 'hard') {
    // Difficult recall
    if (repetition === 0) {
      interval = 1;
      repetition = 1;
    } else {
      interval = Math.max(1, Math.round(interval * 1.2));
    }
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (rating === 'good') {
    // Normal successful recall
    if (repetition === 0) {
      interval = 1;
      repetition = 1;
    } else if (repetition === 1) {
      interval = 6;
      repetition = 2;
    } else {
      interval = Math.round(interval * easeFactor);
      repetition += 1;
    }
  } else if (rating === 'easy') {
    // Effortless recall
    if (repetition === 0) {
      interval = 4;
      repetition = 1;
    } else if (repetition === 1) {
      interval = 8;
      repetition = 2;
    } else {
      interval = Math.round(interval * easeFactor * 1.3);
      repetition += 1;
    }
    easeFactor = Math.min(3.0, easeFactor + 0.15);
  }

  const nextReviewDate = addDaysToDate(today, interval);

  // Determine updated status
  let newStatus: LearningStatus = 'learning';
  if (repetition >= 5 && easeFactor >= 2.3) {
    newStatus = 'mastered';
  } else if (repetition >= 2) {
    newStatus = 'review';
  } else if (repetition >= 1) {
    newStatus = 'learning';
  }

  return {
    srs: {
      repetition,
      interval,
      easeFactor: Number(easeFactor.toFixed(2)),
      lapses,
      lastRating: rating,
      nextReviewDate,
      lastReviewedDate: new Date().toISOString(),
    },
    newStatus,
  };
}

export function isItemDue(srs: SRSState): boolean {
  const today = getTodayDateString();
  return !srs?.nextReviewDate || srs.nextReviewDate <= today;
}
