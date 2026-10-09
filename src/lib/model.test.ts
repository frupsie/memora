import { describe, expect, it } from 'vitest';
import { deckById } from '../data/deck.ts';
import { DEFAULT_WEIGHTS, features, halfLife, learn, recallChance } from './model.ts';

const gakusei = deckById.get('ja-gakusei')!; // shared meaning
const tegami = deckById.get('ja-tegami')!; // false friend
const tomodachi = deckById.get('ja-tomodachi')!; // different word
const youyu = deckById.get('zh-yóuyù')!; // Chinese

describe('half-life regression', () => {
  it('starts a new Japanese word at about half a day', () => {
    expect(halfLife(DEFAULT_WEIGHTS, features(tomodachi, 0, 0))).toBeCloseTo(0.5);
  });

  it('expects Chinese to last longer than Japanese, and false friends to fade fastest', () => {
    const h = (card: typeof gakusei) => halfLife(DEFAULT_WEIGHTS, features(card, 0, 0));
    expect(h(youyu)).toBeGreaterThan(h(gakusei));
    expect(h(gakusei)).toBeGreaterThan(h(tomodachi));
    expect(h(tomodachi)).toBeGreaterThan(h(tegami));
  });

  it('lengthens the half-life with right answers and shortens it with misses', () => {
    const base = halfLife(DEFAULT_WEIGHTS, features(tomodachi, 2, 0));
    expect(halfLife(DEFAULT_WEIGHTS, features(tomodachi, 5, 0))).toBeGreaterThan(base);
    expect(halfLife(DEFAULT_WEIGHTS, features(tomodachi, 2, 3))).toBeLessThan(base);
  });

  it('gives 50% recall after exactly one half-life', () => {
    expect(recallChance(3, 3)).toBeCloseTo(0.5);
    expect(recallChance(3, 0)).toBeGreaterThan(0.99);
  });

  it('learns from a surprise: a miss lowers the next prediction, a recall raises it', () => {
    const x = features(tomodachi, 1, 0);
    const before = recallChance(halfLife(DEFAULT_WEIGHTS, x), 1);
    expect(recallChance(halfLife(learn(DEFAULT_WEIGHTS, x, 1, false), x), 1)).toBeLessThan(before);
    expect(recallChance(halfLife(learn(DEFAULT_WEIGHTS, x, 1, true), x), 1)).toBeGreaterThan(before);
  });
});
