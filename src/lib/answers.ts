/** Checking typed Japanese readings (kana or romaji), and cutting the blank out of a Chinese example sentence. */

import { toHiragana, toRomaji } from 'wanakana';

/** `close` counts as right: the reading is there, only a long vowel or a double consonant is off (がっこ for がっこう). */
export type Verdict = 'right' | 'close' | 'wrong';

const MACRONS: Record<string, string> = { ā: 'aa', ī: 'ii', ū: 'uu', ē: 'ee', ō: 'ou', â: 'aa', î: 'ii', û: 'uu', ê: 'ee', ô: 'ou' };

/** Reads what you typed as hiragana, whether you typed it in kana (hiragana or katakana) or romaji. */
export function typedKana(input: string): string {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/[āīūēōâîûêô]/g, (m) => MACRONS[m] ?? m)
    .replace(/\s+/g, '');
  return toHiragana(cleaned);
}

/** Romaji with long vowels and double consonants squashed, so near-misses on length compare equal. */
const squash = (kana: string) =>
  toRomaji(kana)
    .replace(/ou/g, 'o')
    .replace(/ei/g, 'e')
    .replace(/([aiueo])\1+/g, '$1')
    .replace(/([bcdfghjkmprstwz])\1+/g, '$1');

export function checkReading(input: string, kana: string): Verdict {
  const typed = typedKana(input);
  const target = toHiragana(kana);
  if (!typed) return 'wrong';
  if (typed === target) return 'right';
  return squash(typed) === squash(target) ? 'close' : 'wrong';
}

/** Splits an example sentence around the phrase, or null if the phrase is not in it. */
export function clozeParts(example: string | undefined, word: string): [before: string, after: string] | null {
  const at = example?.indexOf(word) ?? -1;
  if (!example || at < 0) return null;
  return [example.slice(0, at), example.slice(at + word.length)];
}
