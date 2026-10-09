import { useEffect, useState } from 'react';
import type { Card, ChineseCard, JapaneseCard } from '../data/deck.ts';

export type Answer = 'right' | 'wrong' | 'known';

interface Props {
  card: Card;
  position: number;
  total: number;
  /** Predicted chance of recall, or null for a card you have not seen before. */
  predicted: number | null;
  onAnswer: (answer: Answer) => void;
  onQuit: () => void;
}

const KIND_LABEL: Record<ChineseCard['kind'], string> = { word: 'Chinese', chengyu: 'Chinese · 成语', phrase: 'Chinese · everyday phrase', mine: 'Chinese · your phrase' };

export function Study({ card, position, total, predicted, onAnswer, onQuit }: Props) {
  const [revealed, setRevealed] = useState(false);
  const isNew = predicted === null;

  // Keyboard: Space or Enter shows the answer, then 1 / ← for "forgot", 2 / → for "remembered", 3 for "already knew".
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLButtonElement && (event.key === ' ' || event.key === 'Enter')) return;
      if (!revealed && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault();
        setRevealed(true);
      } else if (revealed && (event.key === '1' || event.key === 'ArrowLeft')) onAnswer('wrong');
      else if (revealed && (event.key === '2' || event.key === 'ArrowRight')) onAnswer('right');
      else if (isNew && event.key === '3') onAnswer('known');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, isNew, onAnswer]);

  return (
    <main className={`page study study--${card.lang}`}>
      <header className="study__bar">
        <button className="link" onClick={onQuit}>
          ← Home
        </button>
        <span className="study__count">
          {position} / {total}
        </span>
        <div className="study__progress" aria-hidden="true">
          <div style={{ width: `${((position - 1) / total) * 100}%` }} />
        </div>
      </header>

      <section className="flashcard" aria-live="polite">
        <p className="flashcard__meta">
          <span className="chip">{card.lang === 'ja' ? `Japanese · ${card.level}` : KIND_LABEL[card.kind]}</span>
          <span className="flashcard__guess">{isNew ? 'New card' : `Memora predicts ${Math.round(predicted * 100)}% recall`}</span>
        </p>

        {card.lang === 'ja' ? (
          <>
            <p className="flashcard__word" lang="ja">
              {card.word}
            </p>
            <p className="flashcard__task">Say its reading and meaning</p>
            {revealed && (
              <div className="answer">
                <p className="answer__reading" lang="ja">
                  {card.kana}
                </p>
                <p className="answer__romaji">{card.romaji}</p>
                <p className="answer__meaning">{card.meaning}</p>
                <ChineseLink card={card} />
              </div>
            )}
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
                {card.example && (
                  <p className="answer__example" lang="zh-CN">
                    {card.example}
                  </p>
                )}
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
        {isNew && (
          <button key="known" className="link study__known" onClick={() => onAnswer('known')}>
            I already know this, skip it
          </button>
        )}
      </footer>
    </main>
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
