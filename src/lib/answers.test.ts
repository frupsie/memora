import { describe, expect, it } from 'vitest';
import { checkReading, clozeParts } from './answers.ts';

describe('checkReading', () => {
  it('accepts hiragana, katakana and romaji', () => {
    expect(checkReading('がっこう', 'がっこう')).toBe('right');
    expect(checkReading('ガッコウ', 'がっこう')).toBe('right');
    expect(checkReading('gakkou', 'がっこう')).toBe('right');
    expect(checkReading(' Gakkou ', 'がっこう')).toBe('right');
    expect(checkReading('gakkō', 'がっこう')).toBe('right');
  });

  it('accepts other romanisations of the same sounds', () => {
    expect(checkReading('tukue', 'つくえ')).toBe('right');
    expect(checkReading('sinbun', 'しんぶん')).toBe('right');
    expect(checkReading('renshuu', 'れんしゅう')).toBe('right');
  });

  it('calls a missing long vowel or double consonant close', () => {
    expect(checkReading('gakko', 'がっこう')).toBe('close');
    expect(checkReading('gako', 'がっこう')).toBe('close');
    expect(checkReading('sense', 'せんせい')).toBe('close');
  });

  it('rejects the wrong word or nothing at all', () => {
    expect(checkReading('daigaku', 'がっこう')).toBe('wrong');
    expect(checkReading('', 'がっこう')).toBe('wrong');
    expect(checkReading('gakusei', 'がっこう')).toBe('wrong');
  });
});

describe('cloze', () => {
  it('splits the sentence around the phrase', () => {
    expect(clozeParts('我只想躺平。', '躺平')).toEqual(['我只想', '。']);
    expect(clozeParts('没有这个词', '躺平')).toBeNull();
    expect(clozeParts(undefined, '躺平')).toBeNull();
  });
});
