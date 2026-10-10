import type { Card, ChineseCard } from '../data/deck.ts';
import type { Mode } from '../lib/activities.ts';
import { ClozeActivity, FlashcardActivity, ListenActivity, TypeActivity } from './activities.tsx';

export type Answer = 'right' | 'wrong' | 'known';

interface Props {
  card: Card;
  mode: Mode;
  /** All cards, for the wrong choices in the listening and fill-in-the-blank exercises. */
  cards: Card[];
  position: number;
  total: number;
  /** Predicted chance of recall, or null for a card you have not seen before. */
  predicted: number | null;
  onAnswer: (answer: Answer) => void;
  onQuit: () => void;
}

const KIND_LABEL: Record<ChineseCard['kind'], string> = { word: 'Chinese', chengyu: 'Chinese · 成语', phrase: 'Chinese · everyday phrase', mine: 'Chinese · your phrase' };

export function Study({ card, mode, cards, position, total, predicted, onAnswer, onQuit }: Props) {
  const isNew = predicted === null;
  const meta = (
    <p className="flashcard__meta">
      <span className="chip">{card.lang === 'ja' ? `Japanese · ${card.level}` : KIND_LABEL[card.kind]}</span>
      <span className="flashcard__guess">{isNew ? 'New card' : `Memora predicts ${Math.round(predicted * 100)}% recall`}</span>
    </p>
  );

  const skip = isNew && (
    <button className="link study__known" onClick={() => onAnswer('known')}>
      I already know this, skip it
    </button>
  );

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

      {mode === 'type' && card.lang === 'ja' ? (
        <TypeActivity card={card} meta={meta} skip={skip} onAnswer={onAnswer} />
      ) : mode === 'listen' && card.lang === 'ja' ? (
        <ListenActivity card={card} cards={cards} meta={meta} skip={skip} onAnswer={onAnswer} />
      ) : mode === 'cloze' && card.lang === 'zh' ? (
        <ClozeActivity card={card} cards={cards} meta={meta} skip={skip} onAnswer={onAnswer} />
      ) : (
        <FlashcardActivity card={card} meta={meta} skip={skip} onAnswer={onAnswer} />
      )}
    </main>
  );
}
