import { useEffect, useState } from 'react';
import type { Card, JapaneseCard } from '../data/deck.ts';

interface Props {
  card: Card;
  position: number;
  total: number;
  /** Predicted chance of recall, or null for a card you have not seen before. */
  predicted: number | null;
  onAnswer: (recalled: boolean) => void;
  onQuit: () => void;
}

export function Study({ card, position, total, predicted, onAnswer, onQuit }: Props) {
  const [revealed, setRevealed] = useState(false);

  // Keyboard: Space or Enter shows the answer, then 1 / ← for "forgot" and 2 / → for "remembered".
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLButtonElement && (event.key === ' ' || event.key === 'Enter')) return;
      if (!revealed && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault();
        setRevealed(true);
      } else if (revealed && (event.key === '1' || event.key === 'ArrowLeft')) onAnswer(false);
      else if (revealed && (event.key === '2' || event.key === 'ArrowRight')) onAnswer(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, onAnswer]);

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
          <span className="chip">{card.lang === 'ja' ? `Japanese · ${card.level}` : card.kind === 'chengyu' ? 'Chinese · 成语' : 'Chinese'}</span>
          <span className="flashcard__guess">{predicted === null ? 'New card' : `Memora predicts ${Math.round(predicted * 100)}% recall`}</span>
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
              </div>
            )}
          </>
        )}
      </section>

      <footer className="study__actions">
        {revealed ? (
          <>
            <button className="button button--forgot" onClick={() => onAnswer(false)}>
              Forgot
            </button>
            <button className="button button--primary" onClick={() => onAnswer(true)}>
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
