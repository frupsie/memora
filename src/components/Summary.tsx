interface Props {
  right: number;
  wrong: number;
  onHome: () => void;
}

export function Summary({ right, wrong, onHome }: Props) {
  const total = right + wrong;
  return (
    <main className="page summary">
      <p className="summary__mark" lang="ja" aria-hidden="true">
        お疲れ様
      </p>
      <h1 className="summary__title">Session done</h1>
      <p className="summary__score">
        {right} of {total} remembered{wrong > 0 && ` · ${wrong} missed (they will come back sooner)`}
      </p>
      <button className="button button--primary" onClick={onHome} autoFocus>
        Back home
      </button>
    </main>
  );
}
