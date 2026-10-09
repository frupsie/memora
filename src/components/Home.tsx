import type { ReactNode } from 'react';
import { deckById, type Card } from '../data/deck.ts';
import { features, halfLife } from '../lib/model.ts';
import type { Progress } from '../lib/progress.ts';
import { buildSession, deckStats } from '../lib/scheduler.ts';

interface Props {
  cards: Card[];
  progress: Progress;
  onStart: (lang: Card['lang']) => void;
  onPhrases: () => void;
  onReset: () => void;
}

export function Home({ cards, progress, onStart, onPhrases, onReset }: Props) {
  return (
    <main className="page home">
      <header className="home__header">
        <h1 className="home__title">Memora</h1>
        <p className="home__tagline">
          <span lang="ja">記憶</span> · <span lang="zh-CN">记忆</span> — reviews timed just before you forget
        </p>
      </header>

      <Track
        lang="ja"
        name="Japanese"
        native="日本語"
        blurb="Learning from scratch, with your Chinese as a head start."
        action="Study Japanese"
        cards={cards}
        progress={progress}
        onStart={() => onStart('ja')}
      />

      <Track
        lang="zh"
        name="Chinese"
        native="中文"
        blurb="Revision, plus phrases you pick up from conversations, shows and songs."
        action="Revise Chinese"
        cards={cards}
        progress={progress}
        onStart={() => onStart('zh')}
      >
        <button className="button button--accent" onClick={onPhrases}>
          + Add a phrase{progress.phrases.length > 0 && ` · ${progress.phrases.length} saved`}
        </button>
      </Track>

      <MemoryModel weights={progress.weights} />

      <footer className="home__footer">
        <button className="link" onClick={() => exportReviews(cards, progress)} disabled={!progress.reviews.length}>
          Export reviews (CSV)
        </button>
        <button
          className="link link--danger"
          onClick={() => {
            if (confirm('Erase all progress, including your saved phrases, and start over?')) onReset();
          }}
          disabled={!progress.reviews.length && !progress.phrases.length}
        >
          Reset progress
        </button>
      </footer>
    </main>
  );
}

interface TrackProps {
  lang: Card['lang'];
  name: string;
  native: string;
  blurb: string;
  action: string;
  cards: Card[];
  progress: Progress;
  onStart: () => void;
  children?: ReactNode;
}

function Track({ lang, name, native, blurb, action, cards, progress, onStart, children }: TrackProps) {
  const now = Date.now();
  const stats = deckStats(cards, progress, lang, now);
  const session = buildSession(cards, progress, lang, now);
  const fresh = session.filter((card) => !progress.cards[card.id]).length;
  const retention = stats.retention === null ? null : Math.round(stats.retention * 100);

  return (
    <section className={`track track--${lang}`}>
      <div className="track__head">
        <div>
          <h2 className="track__name">
            {name} <span lang={lang === 'ja' ? 'ja' : 'zh-CN'}>{native}</span>
          </h2>
          <p className="track__blurb">{blurb}</p>
        </div>
        <p className="track__retention">
          {retention === null ? '—' : `${retention}%`}
          <span className="track__label">predicted recall</span>
        </p>
      </div>
      <div className="meter" role="img" aria-label={retention === null ? 'No reviews yet' : `${retention}% predicted recall`}>
        <div className="meter__fill" style={{ width: `${retention ?? 0}%` }} />
      </div>
      <p className="track__counts">
        {stats.learned} of {stats.total} learned · {stats.due} due
      </p>
      <div className="track__actions">
        {session.length ? (
          <button className="button button--primary" onClick={onStart}>
            {action} · {session.length - fresh > 0 && `${session.length - fresh} review`}
            {session.length - fresh > 0 && fresh > 0 && ', '}
            {fresh > 0 && `${fresh} new`}
          </button>
        ) : (
          <p className="track__done">All caught up. Cards come back once Memora predicts you are starting to forget them.</p>
        )}
        {children}
      </div>
    </section>
  );
}

/** What the model currently believes about your memory: how long a word lasts after one right answer. */
function MemoryModel({ weights }: { weights: number[] }) {
  const rows: [string, Card][] = [
    ['Japanese, same meaning in Chinese', deckById.get('ja-gakusei')!],
    ['Japanese, false friend', deckById.get('ja-tegami')!],
    ['Japanese, different word', deckById.get('ja-tomodachi')!],
    ['Chinese', deckById.get('zh-yóuyù')!],
  ];
  return (
    <section className="model">
      <h2 className="model__title">Your memory model</h2>
      <p className="model__note">How long until a word answered right once drops to a 50% chance of recall. It adjusts to you with every answer.</p>
      <dl className="model__rows">
        {rows.map(([label, card]) => (
          <div key={label} className="model__row">
            <dt>{label}</dt>
            <dd>{formatDuration(halfLife(weights, features(card, 1, 0)))}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function formatDuration(days: number): string {
  if (days < 1) return `${Math.round(days * 24)} h`;
  if (days < 60) return `${days < 10 ? days.toFixed(1) : Math.round(days)} days`;
  return `${Math.round(days / 30)} months`;
}

function exportReviews(cards: Card[], progress: Progress) {
  const byId = new Map(cards.map((card) => [card.id, card]));
  const header = 'card,lang,kind,reviewed_at,gap_days,times_right_before,times_wrong_before,predicted,recalled';
  const lines = progress.reviews.map((r) => {
    const card = byId.get(r.card);
    const kind = card ? (card.lang === 'ja' ? card.relation : card.kind) : '';
    return [r.card, card?.lang ?? '', kind, new Date(r.at).toISOString(), r.gapDays.toFixed(4), r.timesRightBefore, r.timesWrongBefore, r.predicted.toFixed(4), r.recalled ? 1 : 0].join(',');
  });
  const url = URL.createObjectURL(new Blob([[header, ...lines].join('\n')], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `memora-reviews-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
