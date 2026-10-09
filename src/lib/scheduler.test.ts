import { describe, expect, it } from 'vitest';
import { deck, deckById } from '../data/deck.ts';
import { emptyProgress, recordReview } from './progress.ts';
import { buildSession, deckStats, NEW_PER_DAY, SESSION_SIZE } from './scheduler.ts';

const NOW = new Date('2026-10-10T09:00:00').getTime();
const DAY = 24 * 60 * 60 * 1000;

describe('deck', () => {
  it('has unique ids', () => {
    expect(deckById.size).toBe(deck.length);
  });
});

describe('buildSession', () => {
  it('starts a newcomer on the daily allowance of new cards, easy N5 words first', () => {
    const session = buildSession(deck, emptyProgress(), NOW);
    expect(session.filter((c) => c.lang === 'ja')).toHaveLength(NEW_PER_DAY.ja);
    expect(session.filter((c) => c.lang === 'zh')).toHaveLength(NEW_PER_DAY.zh);
    expect(session.every((c) => c.lang === 'zh' || c.level === 'N5')).toBe(true);
  });

  it('does not hand out more new cards once today’s are used up', () => {
    let progress = emptyProgress();
    for (const card of buildSession(deck, progress, NOW)) progress = recordReview(progress, card, true, NOW);
    expect(buildSession(deck, progress, NOW + 60_000)).toHaveLength(0);
  });

  it('brings back the cards you are most likely to have forgotten, at most 20% of them Chinese', () => {
    let progress = emptyProgress();
    const start = NOW - 30 * DAY;
    // Learn plenty of cards in both languages over a few days, then come back a week later.
    for (let day = 0; day < 4; day++) {
      for (const card of buildSession(deck, progress, start + day * DAY)) progress = recordReview(progress, card, true, start + day * DAY);
    }
    const session = buildSession(deck, progress, start + 11 * DAY);
    expect(session).toHaveLength(SESSION_SIZE);
    expect(session.filter((c) => c.lang === 'zh').length).toBeLessThanOrEqual(SESSION_SIZE * 0.2);
    // Nothing new while there are due reviews to fill the session.
    expect(session.every((c) => progress.cards[c.id])).toBe(true);
  });
});

describe('deckStats', () => {
  it('counts learned and due cards per language', () => {
    let progress = emptyProgress();
    const card = deckById.get('ja-gakusei')!;
    progress = recordReview(progress, card, true, NOW);
    expect(deckStats(deck, progress, 'ja', NOW)).toMatchObject({ learned: 1, due: 0 });
    expect(deckStats(deck, progress, 'ja', NOW + 30 * DAY)).toMatchObject({ learned: 1, due: 1 });
    expect(deckStats(deck, progress, 'zh', NOW).retention).toBeNull();
  });
});
