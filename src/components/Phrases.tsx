import { useEffect, useState, type FormEvent } from 'react';
import type { ChineseCard } from '../data/deck.ts';

type NewPhrase = Pick<ChineseCard, 'word' | 'pinyin' | 'meaning' | 'source' | 'example'>;

interface Props {
  phrases: ChineseCard[];
  onAdd: (phrase: NewPhrase) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
}

const SOURCES = ['a conversation', 'a show', 'a song', 'social media'];

const empty = { word: '', pinyin: '', meaning: '', source: '', example: '' };

export function Phrases({ phrases, onAdd, onRemove, onBack }: Props) {
  const [form, setForm] = useState(empty);
  /** Pinyin fills itself in from the phrase until you edit it by hand. */
  const [pinyinEdited, setPinyinEdited] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    if (pinyinEdited) return;
    const word = form.word.trim();
    if (!word) {
      setForm((f) => ({ ...f, pinyin: '' }));
      return;
    }
    let current = true;
    // Loaded on demand: the pinyin dictionary is large and only this screen needs it.
    import('pinyin-pro').then(({ pinyin }) => {
      if (current) setForm((f) => ({ ...f, pinyin: pinyin(word, { nonZh: 'consecutive' }) }));
    });
    return () => {
      current = false;
    };
  }, [form.word, pinyinEdited]);

  const set = (field: keyof typeof empty) => (event: { target: { value: string } }) => setForm((f) => ({ ...f, [field]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const phrase: NewPhrase = { word: form.word.trim(), pinyin: form.pinyin.trim(), meaning: form.meaning.trim() };
    if (form.source.trim()) phrase.source = form.source.trim();
    if (form.example.trim()) phrase.example = form.example.trim();
    onAdd(phrase);
    setAdded(phrase.word);
    setForm(empty);
    setPinyinEdited(false);
    document.getElementById('phrase-word')?.focus();
  };

  return (
    <main className="page phrases study--zh">
      <header className="study__bar">
        <button className="link" onClick={onBack}>
          ← Home
        </button>
      </header>

      <div>
        <h1 className="phrases__title">Add a phrase</h1>
        <p className="phrases__note">Heard something new in a conversation, a show or a song? Save it here and it joins your next Chinese revision.</p>
      </div>

      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>Phrase</span>
          <input id="phrase-word" lang="zh-CN" className="field__big" value={form.word} onChange={set('word')} placeholder="e.g. 吃土" required autoComplete="off" />
        </label>
        <label className="field">
          <span>Pinyin {!pinyinEdited && form.pinyin && <em>(filled in for you, edit if wrong)</em>}</span>
          <input
            value={form.pinyin}
            onChange={(event) => {
              setPinyinEdited(true);
              set('pinyin')(event);
            }}
            required
            autoComplete="off"
          />
        </label>
        <label className="field">
          <span>Meaning</span>
          <input value={form.meaning} onChange={set('meaning')} placeholder="e.g. broke after overspending" required autoComplete="off" />
        </label>
        <label className="field">
          <span>
            Where you heard it <em>(optional)</em>
          </span>
          <input value={form.source} onChange={set('source')} placeholder="e.g. 繁花 episode 3" list="phrase-sources" autoComplete="off" />
          <datalist id="phrase-sources">
            {SOURCES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label className="field">
          <span>
            Example sentence <em>(optional)</em>
          </span>
          <textarea lang="zh-CN" rows={2} value={form.example} onChange={set('example')} placeholder="The line you heard, or your own sentence" />
        </label>
        <button className="button button--primary" type="submit">
          Save phrase
        </button>
        {added && (
          <p className="form__saved" role="status">
            Saved <span lang="zh-CN">{added}</span>. It will come up in your next Chinese revision.
          </p>
        )}
      </form>

      {phrases.length > 0 && (
        <section className="saved">
          <h2 className="saved__title">Your phrases ({phrases.length})</h2>
          <ul className="saved__list">
            {phrases.map((p) => (
              <li key={p.id} className="saved__item">
                <div>
                  <p>
                    <strong lang="zh-CN">{p.word}</strong> <span className="saved__pinyin">{p.pinyin}</span>
                  </p>
                  <p className="saved__meaning">
                    {p.meaning}
                    {p.source && ` · from ${p.source}`}
                  </p>
                </div>
                <button
                  className="link link--danger"
                  aria-label={`Delete ${p.word}`}
                  onClick={() => {
                    if (confirm(`Delete ${p.word} and its review history?`)) onRemove(p.id);
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
