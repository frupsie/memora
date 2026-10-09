/** Japanese text-to-speech through the browser's built-in voices: free, offline, and on every phone. */

import { useEffect, useState } from 'react';

function japaneseVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('ja'));
  return voices.find((v) => v.localService) ?? voices[0] ?? null;
}

/** Whether this device can speak Japanese. Voices load asynchronously, so this can turn true a moment after start. */
export function useJapaneseVoice(): boolean {
  const [available, setAvailable] = useState(() => japaneseVoice() !== null);
  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return;
    const update = () => setAvailable(japaneseVoice() !== null);
    speechSynthesis.addEventListener('voiceschanged', update);
    update();
    return () => speechSynthesis.removeEventListener('voiceschanged', update);
  }, []);
  return available;
}

export function speakJapanese(text: string): void {
  const voice = japaneseVoice();
  if (!voice) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.85;
  speechSynthesis.speak(utterance);
}
