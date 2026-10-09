import { useEffect, useState } from 'react';
import { deck, type Card } from './data/deck.ts';
import { emptyProgress, loadProgress, recallNow, recordReview, saveProgress } from './lib/progress.ts';
import { buildSession } from './lib/scheduler.ts';
import { Home } from './components/Home.tsx';
import { Study } from './components/Study.tsx';
import { Summary } from './components/Summary.tsx';

type Screen =
  | { name: 'home' }
  | { name: 'study'; queue: Card[]; index: number; retried: string[]; right: number; wrong: number }
  | { name: 'done'; right: number; wrong: number };

/** A missed card comes back this many cards later, once per session. */
const RETRY_GAP = 3;

export function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  useEffect(() => saveProgress(progress), [progress]);

  if (screen.name === 'study') {
    const card = screen.queue[screen.index]!;
    const answer = (recalled: boolean) => {
      setProgress((p) => recordReview(p, card, recalled, Date.now()));
      const retry = !recalled && !screen.retried.includes(card.id);
      const queue = retry ? screen.queue.toSpliced(screen.index + 1 + RETRY_GAP, 0, card) : screen.queue;
      const right = screen.right + (recalled ? 1 : 0);
      const wrong = screen.wrong + (recalled ? 0 : 1);
      if (screen.index + 1 >= queue.length) setScreen({ name: 'done', right, wrong });
      else setScreen({ ...screen, queue, index: screen.index + 1, retried: retry ? [...screen.retried, card.id] : screen.retried, right, wrong });
    };
    return (
      <Study
        key={screen.index}
        card={card}
        position={screen.index + 1}
        total={screen.queue.length}
        predicted={recallNow(progress, card, Date.now())}
        onAnswer={answer}
        onQuit={() => setScreen({ name: 'home' })}
      />
    );
  }

  if (screen.name === 'done') return <Summary right={screen.right} wrong={screen.wrong} onHome={() => setScreen({ name: 'home' })} />;

  return (
    <Home
      progress={progress}
      onStart={() => {
        const queue = buildSession(deck, progress, Date.now());
        if (queue.length) setScreen({ name: 'study', queue, index: 0, retried: [], right: 0, wrong: 0 });
      }}
      onReset={() => setProgress(emptyProgress())}
    />
  );
}
