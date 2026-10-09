/** Picks what to study in one language: cards the model thinks you are about to forget first, then new ones. */

import type { Card, ChineseCard, JapaneseCard } from '../data/deck.ts';
import { recallNow, type Progress } from './progress.ts';

export const SESSION_SIZE = 20;
/** A card is due once its predicted recall drops below this. */
export const RECALL_TARGET = 0.85;
/** New built-in cards per day. Phrases you add yourself are always let in: you chose to learn them. */
export const NEW_PER_DAY: Record<Card['lang'], number> = { ja: 10, zh: 5 };

const LEVEL_ORDER: Record<JapaneseCard['level'], number> = { N5: 0, N4: 1, N3: 2 };
const RELATION_ORDER = { same: 0, different: 1, none: 2 } as const;
const KIND_ORDER: Record<ChineseCard['kind'], number> = { mine: 0, phrase: 1, word: 2, chengyu: 3 };

const startOfDay = (now: number) => new Date(now).setHours(0, 0, 0, 0);

/**
 * Japanese: easier levels first, and within a level the kinds take turns so a session is not all false friends.
 * Chinese: kinds take turns too (phrases, words, chengyu).
 */
function introductionOrder(cards: Card[]): Card[] {
  const turn = new Map<string, number>();
  const counts: Record<string, number> = {};
  for (const card of cards) {
    const group = card.lang === 'ja' ? `${card.level}-${card.relation}` : card.kind;
    counts[group] = (counts[group] ?? 0) + 1;
    turn.set(card.id, counts[group]!);
  }
  const rank = (card: Card) =>
    card.lang === 'ja' ? [LEVEL_ORDER[card.level], turn.get(card.id)!, RELATION_ORDER[card.relation]] : [0, turn.get(card.id)!, KIND_ORDER[card.kind]];
  return [...cards].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    return ra[0]! - rb[0]! || ra[1]! - rb[1]! || ra[2]! - rb[2]!;
  });
}

export interface DeckStats {
  learned: number;
  due: number;
  total: number;
  /** Average predicted recall over the cards you have seen, or null before the first review. */
  retention: number | null;
}

export function deckStats(cards: Card[], progress: Progress, lang: Card['lang'], now: number): DeckStats {
  const own = cards.filter((card) => card.lang === lang);
  const chances = own.map((card) => recallNow(progress, card, now)).filter((p): p is number => p !== null);
  return {
    learned: chances.length,
    due: chances.filter((p) => p < RECALL_TARGET).length,
    total: own.length,
    retention: chances.length ? chances.reduce((a, b) => a + b, 0) / chances.length : null,
  };
}

export function buildSession(cards: Card[], progress: Progress, lang: Card['lang'], now: number, size = SESSION_SIZE): Card[] {
  const own = cards.filter((card) => card.lang === lang);
  const due = own
    .map((card) => ({ card, p: recallNow(progress, card, now) }))
    .filter((entry): entry is { card: Card; p: number } => entry.p !== null && entry.p < RECALL_TARGET)
    .sort((a, b) => a.p - b.p)
    .map((entry) => entry.card);

  const today = startOfDay(now);
  const isMine = (card: Card) => card.lang === 'zh' && card.kind === 'mine';
  const newToday = own.filter((card) => {
    const seen = progress.cards[card.id];
    return seen && !seen.known && !isMine(card) && seen.firstReview >= today;
  }).length;
  const unseen = own.filter((card) => !progress.cards[card.id]);
  const fresh = [
    ...unseen.filter(isMine),
    ...introductionOrder(unseen.filter((card) => !isMine(card))).slice(0, Math.max(0, NEW_PER_DAY[lang] - newToday)),
  ];

  return [...due, ...fresh].slice(0, size);
}
