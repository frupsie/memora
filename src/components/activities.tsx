/**
 * The exercises. Each one shows a card, finds out whether you remembered it, and reports that through `onAnswer`.
 * Typed answers are checked automatically, with a way to overrule the check when it got it wrong (a typo).
 */

import { useEffect, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import type { Card, ChineseCard, JapaneseCard } from '../data/deck.ts';
import { clozeChoices, listeningChoices } from '../lib/activities.ts';
import { checkReading, clozeParts, typedKana, type Verdict } from '../lib/answers.ts';
import { speakJapanese, useJapaneseVoice } from '../lib/speech.ts';
import type { Answer } from './Study.tsx';

interface ActivityProps<C extends Card> {
  card: C;
  meta: ReactNode;
  /** The "I already know this" button for a new card, shown only until you answer. */
  skip: ReactNode;
  onAnswer: (answer: Answer) => void;
}

/* Flashcard: look, recall, reveal, grade yourself. Used to introduce new Japanese words. */

export function FlashcardActivity({ card, meta, skip, onAnswer }: ActivityProps<Card>) {
  const [revealed, setRevealed] = useState(false);

  // Keyboard: Space or Enter shows the answer, then 1 / ← for "forgot" and 2 / → for "remembered".
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLButtonElement && (event.key === ' ' || event.key === 'Enter')) return;
      if (!revealed && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault();
        setRevealed(true);
      } else if (revealed && (event.key === '1' || event.key === 'ArrowLeft')) onAnswer('wrong');
      else if (revealed && (event.key === '2' || event.key === 'ArrowRight')) onAnswer('right');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, onAnswer]);

  useEffect(() => {
    if (revealed && card.lang === 'ja') speakJapanese(card.kana);
  }, [revealed, card]);

  return (
    <>
      <section className="flashcard" aria-live="polite">
        {meta}
        {card.lang === 'ja' ? (
          <>
            <p className="flashcard__word" lang="ja">
              {card.word}
            </p>
            <p className="flashcard__task">Say its reading and meaning</p>
            {revealed && <JapaneseAnswer card={card} />}
          </>
        ) : (
          <>
            <p className="flashcard__prompt">{card.meaning}</p>
            <p className="flashcard__pinyin">{card.pinyin}</p>
            <p className="flashcard__task">Write the characters, in the air or on paper</p>
            {revealed && (
              <div className="answer">
                <p className="flashcard__word" lang="zh-CN">
                  {card.word}
                </p>
                {card.source && <p className="answer__source">From {card.source}</p>}
              </div>
            )}
          </>
        )}
      </section>

      <footer className="study__actions">
        {revealed ? (
          <>
            <button key="wrong" className="button button--forgot" onClick={() => onAnswer('wrong')}>
              Forgot
            </button>
            <button key="right" className="button button--primary" onClick={() => onAnswer('right')}>
              Remembered
            </button>
          </>
        ) : (
          // Keyed so React does not reuse this element (and its keyboard focus) as the "Forgot" button.
          <button key="reveal" className="button button--primary button--wide" onClick={() => setRevealed(true)}>
            Show answer
          </button>
        )}
      </footer>
      {!revealed && skip}
    </>
  );
}

/* Type the reading: kana or romaji, checked automatically. */

export function TypeActivity({ card, meta, skip, onAnswer }: ActivityProps<JapaneseCard>) {
  const [input, setInput] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const preview = typedKana(input);

  const check = (giveUp = false) => {
    setVerdict(giveUp ? 'wrong' : checkReading(input, card.kana));
    speakJapanese(card.kana);
  };

  return (
    <>
      <section className="flashcard" aria-live="polite">
        {meta}
        <p className="flashcard__word" lang="ja">
          {card.word}
        </p>
        {verdict === null ? (
          <div className="typed">
            <label className="flashcard__task" htmlFor="reading">
              Type the reading, in kana or romaji
            </label>
            <input
              id="reading"
              className="typed__input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onEnter(() => check())}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              placeholder="e.g. gakusei or がくせい"
            />
            <p className="typed__preview" lang="ja" aria-hidden="true">
              {preview && preview !== input.trim() ? preview : ' '}
            </p>
          </div>
        ) : (
          <>
            <VerdictBanner verdict={verdict} typed={input}>
              {verdict === 'close' && 'Nearly: check the long vowels and double consonants.'}
            </VerdictBanner>
            <JapaneseAnswer card={card} />
          </>
        )}
      </section>

      <footer className="study__actions">
        {verdict === null ? (
          <>
            <button key="giveup" className="button button--forgot" onClick={() => check(true)}>
              I don’t know
            </button>
            <button key="check" className="button button--primary" onClick={() => check()} disabled={!input.trim()}>
              Check
            </button>
          </>
        ) : (
          <NextButtons verdict={verdict} onAnswer={onAnswer} overrule="I made a typo, count it as right" />
        )}
      </footer>
      {verdict === null && skip}
    </>
  );
}

/* Listen: hear the word, pick its meaning. */

export function ListenActivity({ card, cards, meta, skip, onAnswer }: ActivityProps<JapaneseCard> & { cards: Card[] }) {
  const [choices] = useState(() => listeningChoices(card, cards));
  const [picked, setPicked] = useState<string | null>(null);
  const canSpeak = useJapaneseVoice();
  const verdict: Verdict | null = picked === null ? null : picked === card.meaning ? 'right' : 'wrong';

  useEffect(() => {
    speakJapanese(card.kana);
  }, [card]);

  useChoiceKeys(choices, picked === null, setPicked);

  return (
    <>
      <section className="flashcard" aria-live="polite">
        {meta}
        <button className="listen__play" onClick={() => speakJapanese(card.kana)} disabled={!canSpeak} aria-label="Play the word again">
          <SpeakerIcon />
        </button>
        <p className="flashcard__task">{canSpeak ? 'Listen, then pick the meaning' : 'This device has no Japanese voice'}</p>
        <div className="choices">
          {choices.map((choice, i) => (
            <button
              key={choice}
              className={`choice${picked !== null && choice === card.meaning ? ' choice--right' : ''}${choice === picked && verdict === 'wrong' ? ' choice--wrong' : ''}`}
              onClick={() => setPicked(choice)}
              disabled={picked !== null}
            >
              <span className="choice__key">{i + 1}</span>
              {choice}
            </button>
          ))}
        </div>
        {verdict !== null && (
          <>
            <p className="flashcard__word flashcard__word--small" lang="ja">
              {card.word}
            </p>
            <JapaneseAnswer card={card} showMeaning={false} />
          </>
        )}
      </section>

      {verdict !== null && (
        <footer className="study__actions">
          <NextButtons verdict={verdict} onAnswer={onAnswer} />
        </footer>
      )}
      {verdict === null && skip}
    </>
  );
}

/* Fill the blank: an example sentence with the phrase taken out, and four phrases to choose from. */

export function ClozeActivity({ card, cards, meta, skip, onAnswer }: ActivityProps<ChineseCard> & { cards: Card[] }) {
  const [choices] = useState(() => clozeChoices(card, cards));
  const [picked, setPicked] = useState<ChineseCard | null>(null);
  const verdict: Verdict | null = picked === null ? null : picked.word === card.word ? 'right' : 'wrong';
  const [before, after] = clozeParts(card.example, card.word) ?? ['', ''];

  useChoiceKeys(choices, picked === null, setPicked);

  return (
    <>
      <section className="flashcard" aria-live="polite">
        {meta}
        <p className="cloze" lang="zh-CN">
          {before}
          {verdict === null ? <span className="cloze__blank">{'　'.repeat(card.word.length)}</span> : <mark className="cloze__answer">{card.word}</mark>}
          {after}
        </p>
        <p className="flashcard__prompt flashcard__prompt--small">{card.meaning}</p>
        {verdict === null && <p className="flashcard__task">Pick the phrase that fills the blank</p>}
        <div className="choices">
          {choices.map((choice, i) => (
            <button
              key={choice.id}
              className={`choice${picked !== null && choice.word === card.word ? ' choice--right' : ''}${choice === picked && verdict === 'wrong' ? ' choice--wrong' : ''}`}
              onClick={() => setPicked(choice)}
              disabled={picked !== null}
            >
              <span className="choice__key">{i + 1}</span>
              <span className="choice__text">
                <span className="choice__word" lang="zh-CN">
                  {choice.word}
                </span>
                {/* Once answered, every option shows what it means, so the wrong ones teach something too. */}
                {picked !== null && (
                  <span className="choice__detail">
                    {choice.pinyin} · {choice.meaning}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
        {verdict !== null && card.source && <p className="answer__source">From {card.source}</p>}
      </section>

      {verdict !== null && (
        <footer className="study__actions">
          <NextButtons verdict={verdict} onAnswer={onAnswer} />
        </footer>
      )}
      {verdict === null && skip}
    </>
  );
}

/* Shared pieces */

/** Number keys 1 to 4 pick a choice while picking is still open. */
function useChoiceKeys<T>(choices: T[], open: boolean, pick: (choice: T) => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      const choice = choices[Number(event.key) - 1];
      if (choice !== undefined) pick(choice);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choices, open, pick]);
}

/**
 * Enter checks the answer, except while an input method (Japanese or Chinese keyboard) is still composing:
 * there Enter only confirms the characters.
 */
function onEnter(action: () => void) {
  return (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    if (event.currentTarget.value.trim()) action();
  };
}

function VerdictBanner({ verdict, typed, children }: { verdict: Verdict; typed: string; children?: ReactNode }) {
  const title = verdict === 'right' ? 'Correct' : verdict === 'close' ? 'Almost' : typed.trim() ? 'Not quite' : 'Here it is';
  return (
    <div className={`verdict verdict--${verdict}`} role="status">
      <strong>{title}</strong>
      {verdict !== 'right' && typed.trim() && (
        <span>
          {' '}
          · you wrote <span className="verdict__typed">{typed.trim()}</span>
        </span>
      )}
      {children && <p>{children}</p>}
    </div>
  );
}

function NextButtons({ verdict, onAnswer, overrule }: { verdict: Verdict; onAnswer: (answer: Answer) => void; overrule?: string }) {
  return (
    <>
      <button key="next" className="button button--primary button--wide" onClick={() => onAnswer(verdict === 'wrong' ? 'wrong' : 'right')} autoFocus>
        Next
      </button>
      {verdict === 'wrong' && overrule && (
        <button key="overrule" className="link study__overrule" onClick={() => onAnswer('right')}>
          {overrule}
        </button>
      )}
    </>
  );
}

function JapaneseAnswer({ card, showMeaning = true }: { card: JapaneseCard; showMeaning?: boolean }) {
  const canSpeak = useJapaneseVoice();
  return (
    <div className="answer">
      <p className="answer__reading" lang="ja">
        {card.kana}
        {canSpeak && (
          <button className="speak" onClick={() => speakJapanese(card.kana)} aria-label={`Hear ${card.kana}`}>
            <SpeakerIcon />
          </button>
        )}
      </p>
      <p className="answer__romaji">{card.romaji}</p>
      {showMeaning && <p className="answer__meaning">{card.meaning}</p>}
      <ChineseLink card={card} />
    </div>
  );
}

function ChineseLink({ card }: { card: JapaneseCard }) {
  const zh = (
    <span className="bridge__zh">
      <span lang="zh-CN">{card.zh.word}</span> {card.zh.pinyin}
    </span>
  );
  if (card.relation === 'same') return <p className="bridge bridge--same">Same in Chinese: {zh}</p>;
  if (card.relation === 'different')
    return (
      <p className="bridge bridge--different">
        <strong>False friend.</strong> In Chinese, {zh} means “{card.zh.meaning}”.
      </p>
    );
  return <p className="bridge">In Chinese: {zh}</p>;
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}
