/**
 * Half-life regression (Settles & Meeder, "A Trainable Spaced Repetition Model for Language Learning", Duolingo 2016).
 *
 * Every card has a memory half-life h, in days: after h days without review you have a 50% chance of still
 * remembering it. The half-life comes from the card's features: h = 2^(weights · features).
 * The chance of recall after a gap of t days is then p = 2^(-t / h).
 *
 * The weights start from sensible guesses and learn online from every review you make, so the predictions
 * gradually fit your own memory, for example how much your Chinese actually helps with kanji words.
 */

import type { Card } from '../data/deck.ts';

export const FEATURES = ['bias', 'timesRight', 'timesWrong', 'chinese', 'sharedMeaning', 'falseFriend'] as const;

/**
 * Starting weights, in log2-days. A new Japanese word starts at a half-life of about 12 hours, and each feature
 * moves it from there: answers you got right lengthen it, misses shorten it, Chinese (which you already know)
 * lasts far longer, a shared meaning helps, and a false friend hurts.
 */
export const DEFAULT_WEIGHTS: readonly number[] = [-1, 1.6, -0.8, 3, 1, -0.5];

const MIN_HALF_LIFE = 15 / (24 * 60); // 15 minutes
const MAX_HALF_LIFE = 274; // about 9 months
const LEARNING_RATE = 0.05;
/** Pulls the weights gently back toward the defaults, so a handful of odd reviews cannot run away with them. */
const PRIOR_STRENGTH = 0.01;

export function features(card: Card, timesRight: number, timesWrong: number): number[] {
  return [
    1,
    Math.sqrt(timesRight),
    Math.sqrt(timesWrong),
    card.lang === 'zh' ? 1 : 0,
    card.lang === 'ja' && card.relation === 'same' ? 1 : 0,
    card.lang === 'ja' && card.relation === 'different' ? 1 : 0,
  ];
}

export function halfLife(weights: readonly number[], x: readonly number[]): number {
  const exponent = x.reduce((sum, value, i) => sum + value * (weights[i] ?? 0), 0);
  return Math.min(MAX_HALF_LIFE, Math.max(MIN_HALF_LIFE, 2 ** exponent));
}

/** Chance of remembering after `gapDays` days, kept just inside (0, 1) so the learning step's logarithm stays finite. */
export function recallChance(halfLifeDays: number, gapDays: number): number {
  return Math.min(0.9999, Math.max(0.0001, 2 ** (-Math.max(0, gapDays) / halfLifeDays)));
}

/** One step of gradient descent on the squared error between the predicted recall and what actually happened. */
export function learn(weights: readonly number[], x: readonly number[], gapDays: number, recalled: boolean): number[] {
  const p = recallChance(halfLife(weights, x), gapDays);
  // dp/dw_i = -p · ln(p) · ln(2) · x_i, from p = 2^(-t/h) and h = 2^(w·x).
  const slope = 2 * (p - (recalled ? 1 : 0)) * -p * Math.log(p) * Math.LN2;
  return weights.map((w, i) => w - LEARNING_RATE * (slope * (x[i] ?? 0) + PRIOR_STRENGTH * (w - (DEFAULT_WEIGHTS[i] ?? 0))));
}
