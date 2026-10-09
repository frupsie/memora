import type { Card } from '../data/deck.ts';

interface Props {
  lang: Card['lang'];
  right: number;
  wrong: number;
  known: number;
  onHome: () => void;
}

export function Summary({ lang, right, wrong, known, onHome }: Props) {
  const tested = right + wrong;
  return (
    <main className="page summary">
      {lang === 'ja' ? (
        <p className="summary__mark summary__mark--ja" lang="ja" aria-hidden="true">
          お疲れ様
        </p>
      ) : (
        <p className="summary__mark summary__mark--zh" lang="zh-CN" aria-hidden="true">
          辛苦了
        </p>
      )}
      <h1 className="summary__title">Session done</h1>
      <p className="summary__score">
        {tested > 0 && `${right} of ${tested} remembered`}
        {wrong > 0 && ` · ${wrong} missed (they will come back sooner)`}
        {known > 0 && `${tested > 0 ? ' · ' : ''}${known} you already knew`}
      </p>
      <button className="button button--primary" onClick={onHome} autoFocus>
        Back home
      </button>
    </main>
  );
}
