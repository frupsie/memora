/** Which kind of exercise each card gets. Every kind ends in remembered or forgot, so the model learns from all of them. */

import type { Card, JapaneseCard } from '../data/deck.ts';
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

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
