import { useEffect, useMemo, useState } from 'react';
import { deck, type Card } from './data/deck.ts';
import { addPhrase, emptyProgress, loadProgress, markKnown, recallNow, recordReview, removePhrase, saveProgress } from './lib/progress.ts';
import { buildSession } from './lib/scheduler.ts';
import { chooseMode } from './lib/activities.ts';
import { useJapaneseVoice } from './lib/speech.ts';
import { Home } from './components/Home.tsx';
import { Study, type Answer } from './components/Study.tsx';
import { Summary } from './components/Summary.tsx';
import { Phrases } from './components/Phrases.tsx';

type Screen =
  | { name: 'home' }
  | { name: 'phrases' }
  | {
      name: 'study';
      lang: Card['lang'];
      queue: Card[];
      index: number;
      retried: string[];
      right: number;
      wrong: number;
      known: number;
      /** Whether listening exercises are possible, fixed for the session so an exercise never switches mid-card. */
      canSpeak: boolean;
    }
  | { name: 'done'; lang: Card['lang']; right: number; wrong: number; known: number };

/** A missed card comes back this many cards later, once per session. */
const RETRY_GAP = 3;

export function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const cards = useMemo(() => [...deck, ...progress.phrases], [progress.phrases]);
  const canSpeak = useJapaneseVoice();

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen.name]);

  if (screen.name === 'study') {
    const card = screen.queue[screen.index]!;
    const mode = chooseMode(card, progress, screen.canSpeak);
    const answer = (result: Answer) => {
      const now = Date.now();
      setProgress((p) => (result === 'known' ? markKnown(p, card, now) : recordReview(p, card, result === 'right', now, mode)));
      const retry = result === 'wrong' && !screen.retried.includes(card.id);
      const queue = retry ? screen.queue.toSpliced(screen.index + 1 + RETRY_GAP, 0, card) : screen.queue;
      const tally = {
        right: screen.right + (result === 'right' ? 1 : 0),
        wrong: screen.wrong + (result === 'wrong' ? 1 : 0),
        known: screen.known + (result === 'known' ? 1 : 0),
      };
      if (screen.index + 1 >= queue.length) setScreen({ name: 'done', lang: screen.lang, ...tally });
      else setScreen({ ...screen, ...tally, queue, index: screen.index + 1, retried: retry ? [...screen.retried, card.id] : screen.retried });
    };
    return (
      <Study
        key={screen.index}
        card={card}
        mode={mode}
        cards={cards}
        position={screen.index + 1}
        total={screen.queue.length}
        predicted={recallNow(progress, card, Date.now())}
        onAnswer={answer}
        onQuit={() => setScreen({ name: 'home' })}
      />
    );
  }

  if (screen.name === 'done') return <Summary {...screen} onHome={() => setScreen({ name: 'home' })} />;

  if (screen.name === 'phrases')
    return (
      <Phrases
        phrases={progress.phrases}
        onAdd={(phrase) => setProgress((p) => addPhrase(p, phrase, Date.now()))}
        onRemove={(id) => setProgress((p) => removePhrase(p, id))}
        onBack={() => setScreen({ name: 'home' })}
      />
    );

  return (
    <Home
      cards={cards}
      progress={progress}
      onStart={(lang) => {
        const queue = buildSession(cards, progress, lang, Date.now());
        if (queue.length) setScreen({ name: 'study', lang, queue, index: 0, retried: [], right: 0, wrong: 0, known: 0, canSpeak });
      }}
      onPhrases={() => setScreen({ name: 'phrases' })}
      onReset={() => setProgress(emptyProgress())}
    />
  );
}
