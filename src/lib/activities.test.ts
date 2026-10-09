import { describe, expect, it } from 'vitest';
import { deck, deckById, type JapaneseCard } from '../data/deck.ts';
import { chooseMode, listeningChoices } from './activities.ts';
import { addPhrase, emptyProgress, recordReview } from './progress.ts';

const NOW = new Date('2026-10-10T09:00:00').getTime();
const gakusei = deckById.get('ja-gakusei') as JapaneseCard;

describe('chooseMode', () => {
  it('introduces a new Japanese word as a flashcard', () => {
    expect(chooseMode(gakusei, emptyProgress(), true)).toBe('flashcard');
  });

  it('alternates typing and listening on Japanese reviews', () => {
    let progress = recordReview(emptyProgress(), gakusei, true, NOW);
    expect(chooseMode(gakusei, progress, true)).toBe('listen');
    progress = recordReview(progress, gakusei, true, NOW + 1000);
    expect(chooseMode(gakusei, progress, true)).toBe('type');
  });

  it('never picks listening on a device without a Japanese voice', () => {
    const progress = recordReview(emptyProgress(), gakusei, true, NOW);
    expect(chooseMode(gakusei, progress, false)).toBe('type');
  });

  it('uses fill-in-the-blank for Chinese with an example, a flashcard without one', () => {
    expect(chooseMode(deckById.get('zh-tǎngpíng')!, emptyProgress(), true)).toBe('cloze');
    const progress = addPhrase(emptyProgress(), { word: '吃土', pinyin: 'chī tǔ', meaning: 'broke' }, NOW);
    expect(chooseMode(progress.phrases[0]!, progress, true)).toBe('flashcard');
  });
});

describe('listeningChoices', () => {
  it('offers four different meanings including the right one', () => {
    const choices = listeningChoices(gakusei, deck);
    expect(choices).toHaveLength(4);
    expect(new Set(choices).size).toBe(4);
    expect(choices).toContain('student');
  });
});
