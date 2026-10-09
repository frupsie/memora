/** What Memora remembers about you: per-card history, the model's learned weights, and the full review log. */

import type { Card, ChineseCard } from '../data/deck.ts';
import type { Mode } from './activities.ts';
import { DEFAULT_WEIGHTS, features, halfLife, learn, recallChance } from './model.ts';

export interface CardProgress {
  timesRight: number;
  timesWrong: number;
  firstReview: number;
  lastReview: number;
  /** You already knew it when it first came up, so it did not use up a new-card slot. */
  known?: boolean;
}

/** Marking a new card as already known counts as this many right answers, enough to push its next review days away. */
const KNOWN_AS_RIGHT = 3;

/** One answer, with everything needed to retrain the model offline from an export. */
export interface Review {
  card: string;
  at: number;
  gapDays: number;
  timesRightBefore: number;
  timesWrongBefore: number;
  predicted: number;
  recalled: boolean;
  /** Which exercise it was. Not a model feature yet, but logged so a retrained model can learn that listening is harder than typing. */
  mode?: Mode;
}

export interface Progress {
  version: 1;
  cards: Record<string, CardProgress>;
  weights: number[];
  reviews: Review[];
  /** Chinese phrases you added yourself. */
  phrases: ChineseCard[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'memora:v1';

export const emptyProgress = (): Progress => ({ version: 1, cards: {}, weights: [...DEFAULT_WEIGHTS], reviews: [], phrases: [] });

/** Predicted chance you remember `card` right now, or null if you have never seen it. */
export function recallNow(progress: Progress, card: Card, now: number): number | null {
  const seen = progress.cards[card.id];
  if (!seen) return null;
  const h = halfLife(progress.weights, features(card, seen.timesRight, seen.timesWrong));
  return recallChance(h, (now - seen.lastReview) / DAY_MS);
}

export function recordReview(progress: Progress, card: Card, recalled: boolean, now: number, mode?: Mode): Progress {
  const seen = progress.cards[card.id];
  const timesRight = seen?.timesRight ?? 0;
  const timesWrong = seen?.timesWrong ?? 0;
  const x = features(card, timesRight, timesWrong);
  const gapDays = seen ? (now - seen.lastReview) / DAY_MS : 0;
  const predicted = seen ? recallChance(halfLife(progress.weights, x), gapDays) : 0;

  return {
    ...progress,
    cards: {
      ...progress.cards,
      [card.id]: {
        timesRight: timesRight + (recalled ? 1 : 0),
        timesWrong: timesWrong + (recalled ? 0 : 1),
        firstReview: seen?.firstReview ?? now,
        lastReview: now,
      },
    },
    // A first sighting has no gap to learn from: it says nothing about forgetting.
    weights: seen ? learn(progress.weights, x, gapDays, recalled) : progress.weights,
    reviews: [
      ...progress.reviews,
      { card: card.id, at: now, gapDays, timesRightBefore: timesRight, timesWrongBefore: timesWrong, predicted, recalled, ...(mode && { mode }) },
    ],
  };
}

/** For a new card you already know: skip the learning steps without teaching the model anything about forgetting. */
export function markKnown(progress: Progress, card: Card, now: number): Progress {
  return {
    ...progress,
    cards: { ...progress.cards, [card.id]: { timesRight: KNOWN_AS_RIGHT, timesWrong: 0, firstReview: now, lastReview: now, known: true } },
  };
}

export function addPhrase(progress: Progress, phrase: Omit<ChineseCard, 'id' | 'lang' | 'kind'>, now: number): Progress {
  return { ...progress, phrases: [{ ...phrase, id: `mine-${now.toString(36)}`, lang: 'zh', kind: 'mine' }, ...progress.phrases] };
}

/** Deletes one of your phrases, along with its review history. */
export function removePhrase(progress: Progress, id: string): Progress {
  const { [id]: _removed, ...cards } = progress.cards;
  return { ...progress, cards, phrases: progress.phrases.filter((p) => p.id !== id), reviews: progress.reviews.filter((r) => r.card !== id) };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Progress;
      if (parsed.version === 1 && parsed.weights.length === DEFAULT_WEIGHTS.length) return { ...parsed, phrases: parsed.phrases ?? [] };
    }
  } catch {
    // Storage blocked or the saved data is unreadable: start fresh rather than fail to open.
  }
  return emptyProgress();
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Private browsing or full storage: progress lasts for this visit only.
  }
}
