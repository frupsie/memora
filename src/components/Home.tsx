import { deck, deckById, type Card } from '../data/deck.ts';
import { features, halfLife } from '../lib/model.ts';
import type { Progress } from '../lib/progress.ts';
import { buildSession, deckStats, type DeckStats } from '../lib/scheduler.ts';

interface Props {
  progress: Progress;
  onStart: () => void;
  onReset: () => void;
}

export function Home({ progress, onStart, onReset }: Props) {
  const now = Date.now();
  const session = buildSession(deck, progress, now);
  const fresh = session.filter((card) => !progress.cards[card.id]).length;

  return (
    <main className="page home">
      <header className="home__header">
        <h1 className="home__title">Memora</h1>
        <p className="home__tagline">
          <span lang="ja">記憶</span> · <span lang="zh-CN">记忆</span> — reviews timed just before you forget
        </p>
      </header>

      <section className="langs" aria-label="Your languages">
        <LangPanel lang="ja" name="Japanese" native="日本語" stats={deckStats(deck, progress, 'ja', now)} />
        <LangPanel lang="zh" name="Chinese" native="中文" stats={deckStats(deck, progress, 'zh', now)} />
      </section>

      <section className="start">
        {session.length ? (
          <>
            <p className="start__plan">
              Next session: <strong>{session.length} cards</strong>
              {session.length - fresh > 0 && ` · ${session.length - fresh} to review`}
              {fresh > 0 && ` · ${fresh} new`}
            </p>
            <button className="button button--primary" onClick={onStart}>
              Start session
            </button>
          </>
        ) : (
          <p className="start__plan">
            <strong>All caught up.</strong> Memora will bring words back once it predicts you are starting to forget them.
          </p>
        )}
      </section>

      <MemoryModel weights={progress.weights} />

      <footer className="home__footer">
        <button className="link" onClick={() => exportReviews(progress)} disabled={!progress.reviews.length}>
          Export reviews (CSV)
        </button>
        <button
          className="link link--danger"
          onClick={() => {
            if (confirm('Erase all progress and start over?')) onReset();
          }}
          disabled={!progress.reviews.length}
        >
          Reset progress
        </button>
      </footer>
    </main>
  );
}

function LangPanel({ lang, name, native, stats }: { lang: Card['lang']; name: string; native: string; stats: DeckStats }) {
  const retention = stats.retention === null ? null : Math.round(stats.retention * 100);
  return (
    <article className={`lang lang--${lang}`}>
      <h2 className="lang__name">
        {name} <span lang={lang === 'ja' ? 'ja' : 'zh-CN'}>{native}</span>
      </h2>
      <p className="lang__retention">
        {retention === null ? '—' : `${retention}%`}
        <span className="lang__label">predicted recall</span>
      </p>
      <div className="meter" role="img" aria-label={retention === null ? 'No reviews yet' : `${retention}% predicted recall`}>
        <div className="meter__fill" style={{ width: `${retention ?? 0}%` }} />
      </div>
      <p className="lang__counts">
        {stats.learned} of {stats.total} learned · {stats.due} due
      </p>
    </article>
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

function exportReviews(progress: Progress) {
  const header = 'card,lang,relation,reviewed_at,gap_days,times_right_before,times_wrong_before,predicted,recalled';
  const lines = progress.reviews.map((r) => {
    const card = deckById.get(r.card);
    const relation = card?.lang === 'ja' ? card.relation : '';
    return [r.card, card?.lang ?? '', relation, new Date(r.at).toISOString(), r.gapDays.toFixed(4), r.timesRightBefore, r.timesWrongBefore, r.predicted.toFixed(4), r.recalled ? 1 : 0].join(',');
  });
  const url = URL.createObjectURL(new Blob([[header, ...lines].join('\n')], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `memora-reviews-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
