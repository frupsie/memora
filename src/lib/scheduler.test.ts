import { describe, expect, it } from 'vitest';
import { deck, deckById } from '../data/deck.ts';
import { addPhrase, emptyProgress, markKnown, recordReview, removePhrase } from './progress.ts';
import { buildSession, deckStats, NEW_PER_DAY, SESSION_SIZE } from './scheduler.ts';

const NOW = new Date('2026-10-10T09:00:00').getTime();
const DAY = 24 * 60 * 60 * 1000;

describe('deck', () => {
  it('has unique ids', () => {
    expect(deckById.size).toBe(deck.length);
  });
});

describe('buildSession', () => {
  it('keeps the languages apart', () => {
    expect(buildSession(deck, emptyProgress(), 'ja', NOW).every((c) => c.lang === 'ja')).toBe(true);
    expect(buildSession(deck, emptyProgress(), 'zh', NOW).every((c) => c.lang === 'zh')).toBe(true);
  });

  it('starts a newcomer on the daily allowance of new cards, easy N5 words first', () => {
    const session = buildSession(deck, emptyProgress(), 'ja', NOW);
    expect(session).toHaveLength(NEW_PER_DAY.ja);
    expect(session.every((c) => c.lang === 'ja' && c.level === 'N5')).toBe(true);
  });

  it('does not hand out more new cards once today’s are used up', () => {
    let progress = emptyProgress();
    for (const card of buildSession(deck, progress, 'ja', NOW)) progress = recordReview(progress, card, true, NOW);
    expect(buildSession(deck, progress, 'ja', NOW + 60_000)).toHaveLength(0);
  });

  it('does not count words you already knew against the daily allowance', () => {
    let progress = emptyProgress();
    for (const card of buildSession(deck, progress, 'ja', NOW)) progress = markKnown(progress, card, NOW);
    expect(buildSession(deck, progress, 'ja', NOW + 60_000)).toHaveLength(NEW_PER_DAY.ja);
  });

  it('brings back the cards you are most likely to have forgotten before anything new', () => {
    let progress = emptyProgress();
    const start = NOW - 30 * DAY;
    for (let day = 0; day < 4; day++) {
      for (const card of buildSession(deck, progress, 'ja', start + day * DAY)) progress = recordReview(progress, card, true, start + day * DAY);
    }
    const session = buildSession(deck, progress, 'ja', start + 11 * DAY);
    expect(session).toHaveLength(SESSION_SIZE);
    expect(session.every((c) => progress.cards[c.id])).toBe(true);
  });

  it('always lets in phrases you added, first, on top of the daily allowance', () => {
    let progress = emptyProgress();
    for (const card of buildSession(deck, progress, 'zh', NOW)) progress = recordReview(progress, card, true, NOW);
    progress = addPhrase(progress, { word: '吃土', pinyin: 'chī tǔ', meaning: 'broke after overspending' }, NOW);
    const session = buildSession([...deck, ...progress.phrases], progress, 'zh', NOW + 60_000);
    expect(session.map((c) => c.word)).toEqual(['吃土']);
  });
});

describe('phrases', () => {
  it('removes a phrase together with its history', () => {
    let progress = addPhrase(emptyProgress(), { word: '吃土', pinyin: 'chī tǔ', meaning: 'broke' }, NOW);
    const phrase = progress.phrases[0]!;
    progress = recordReview(progress, phrase, true, NOW);
    progress = removePhrase(progress, phrase.id);
    expect(progress.phrases).toHaveLength(0);
    expect(progress.cards[phrase.id]).toBeUndefined();
    expect(progress.reviews).toHaveLength(0);
  });
});

describe('deckStats', () => {
  it('counts learned and due cards per language', () => {
    let progress = emptyProgress();
    progress = recordReview(progress, deckById.get('ja-gakusei')!, true, NOW);
    expect(deckStats(deck, progress, 'ja', NOW)).toMatchObject({ learned: 1, due: 0 });
    expect(deckStats(deck, progress, 'ja', NOW + 30 * DAY)).toMatchObject({ learned: 1, due: 1 });
    expect(deckStats(deck, progress, 'zh', NOW).retention).toBeNull();
  });
});
