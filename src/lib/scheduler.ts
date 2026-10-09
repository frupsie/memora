/** Picks what to study: cards the model thinks you are about to forget first, then new ones, mostly Japanese. */

import type { Card, JapaneseCard } from '../data/deck.ts';
import { recallNow, type Progress } from './progress.ts';

export const SESSION_SIZE = 20;
/** Share of each session kept for Chinese maintenance. */
export const CHINESE_SHARE = 0.2;
/** A card is due once its predicted recall drops below this. */
export const RECALL_TARGET = 0.85;
export const NEW_PER_DAY: Record<Card['lang'], number> = { ja: 10, zh: 3 };

const LEVEL_ORDER: Record<JapaneseCard['level'], number> = { N5: 0, N4: 1, N3: 2 };
const RELATION_ORDER = { same: 0, different: 1, none: 2 } as const;

const startOfDay = (now: number) => new Date(now).setHours(0, 0, 0, 0);

/** Easier levels first, and within a level the kinds take turns so a session is not all false friends at once. */
function introductionOrder(cards: Card[]): Card[] {
  const turn = new Map<string, number>();
  const counts: Record<string, number> = {};
  for (const card of cards) {
    const group = card.lang === 'ja' ? `${card.level}-${card.relation}` : card.kind;
    counts[group] = (counts[group] ?? 0) + 1;
    turn.set(card.id, counts[group]!);
  }
  const rank = (card: Card) =>
    card.lang === 'ja' ? [LEVEL_ORDER[card.level], turn.get(card.id)!, RELATION_ORDER[card.relation]] : [0, turn.get(card.id)!, card.kind === 'word' ? 0 : 1];
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

export function deckStats(deck: Card[], progress: Progress, lang: Card['lang'], now: number): DeckStats {
  const cards = deck.filter((card) => card.lang === lang);
  const chances = cards.map((card) => recallNow(progress, card, now)).filter((p): p is number => p !== null);
  return {
    learned: chances.length,
    due: chances.filter((p) => p < RECALL_TARGET).length,
    total: cards.length,
    retention: chances.length ? chances.reduce((a, b) => a + b, 0) / chances.length : null,
  };
}

export function buildSession(deck: Card[], progress: Progress, now: number, size = SESSION_SIZE): Card[] {
  const today = startOfDay(now);
  const pick = (lang: Card['lang']) => {
    const cards = deck.filter((card) => card.lang === lang);
    const due = cards
      .map((card) => ({ card, p: recallNow(progress, card, now) }))
      .filter((entry): entry is { card: Card; p: number } => entry.p !== null && entry.p < RECALL_TARGET)
      .sort((a, b) => a.p - b.p)
      .map((entry) => entry.card);
    const newToday = cards.filter((card) => (progress.cards[card.id]?.firstReview ?? -1) >= today).length;
    const fresh = introductionOrder(cards.filter((card) => !progress.cards[card.id])).slice(0, Math.max(0, NEW_PER_DAY[lang] - newToday));
    return [...due, ...fresh];
  };

  const ja = pick('ja');
  const zh = pick('zh');
  const zhSlots = Math.min(zh.length, Math.max(Math.round(size * CHINESE_SHARE), size - ja.length));
  const chosenZh = zh.slice(0, zhSlots);
  const chosenJa = ja.slice(0, size - chosenZh.length);

  // Spread the Chinese cards evenly through the Japanese ones.
  const session: Card[] = [...chosenJa];
  chosenZh.forEach((card, i) => {
    session.splice(Math.round(((i + 1) * chosenJa.length) / (chosenZh.length + 1)) + i, 0, card);
  });
  return session;
}
