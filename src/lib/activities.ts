/** Which kind of exercise each card gets. Every kind ends in remembered or forgot, so the model learns from all of them. */

import type { Card, ChineseCard, JapaneseCard } from '../data/deck.ts';
import { clozeParts } from './answers.ts';
import type { Progress } from './progress.ts';

export type Mode = 'flashcard' | 'type' | 'listen' | 'cloze';

/**
 * Japanese: a new word is introduced as a flashcard; after that, reviews alternate between typing the reading
 * and hearing the word (when the device has a Japanese voice).
 * Chinese: fill the blank in an example sentence, or a flashcard for a phrase without one.
 */
export function chooseMode(card: Card, progress: Progress, canSpeak: boolean): Mode {
  if (card.lang === 'zh') return clozeParts(card.example, card.word) ? 'cloze' : 'flashcard';
  const seen = progress.cards[card.id];
  if (!seen) return 'flashcard';
  return canSpeak && (seen.timesRight + seen.timesWrong) % 2 === 1 ? 'listen' : 'type';
}

/** Four meanings to pick from when listening: the right one and three others, shuffled. */
export function listeningChoices(card: JapaneseCard, cards: Card[], random = Math.random): string[] {
  const others = [...new Set(cards.filter((c) => c.lang === 'ja' && c.meaning !== card.meaning).map((c) => c.meaning))];
  const picked = shuffle(others, random).slice(0, 3);
  return shuffle([card.meaning, ...picked], random);
}

/**
 * Four phrases for a fill-in-the-blank: the right one and three that look like they could fit. Same length first
 * (a 成语 blank among 成语), then the same kind, so the shape of the blank does not give the answer away.
 */
export function clozeChoices(card: ChineseCard, cards: Card[], random = Math.random): ChineseCard[] {
  const others = cards.filter((c): c is ChineseCard => c.lang === 'zh' && c.word !== card.word);
  const closeness = (c: ChineseCard) => (c.word.length === card.word.length ? 0 : 2) + (c.kind === card.kind ? 0 : 1);
  const picked = shuffle(others, random)
    .sort((a, b) => closeness(a) - closeness(b))
    .slice(0, 3);
  return shuffle([card, ...picked], random);
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
