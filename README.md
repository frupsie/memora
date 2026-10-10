# Memora

Learn Japanese and keep your Chinese sharp. Memora predicts when you are about to forget each word and brings it back just before you do.

## How it works

Japanese and Chinese are studied separately, each with its own session.

- **Japanese: learning from scratch, building on your Chinese.** Every Japanese card says how it relates to Chinese:
  - *same meaning*, e.g. 学生 (gakusei / xuésheng)
  - *false friend*, e.g. 手紙 is "letter" in Japanese but 手纸 is "toilet paper" in Chinese
  - *different word*, e.g. 友達 (tomodachi) where Chinese says 朋友

  Ten new words a day. Words you already know can be skipped with "I already know this", and they don't count toward the ten.
- **Chinese: revision plus your own phrases.** Advanced words, 成语 and everyday expressions (内卷, 躺平, 破防…). You see the meaning and pinyin and write the characters, to fight 提笔忘字. **Add a phrase** saves things you pick up from conversations, shows and songs, with where you heard it and an example line. Pinyin fills in automatically. Your phrases always join the next revision, ahead of the built-in ones.
- **Different exercises, picked per card.** Every exercise ends in remembered or forgot, so the model learns from all of them:
  - *Flashcard*: introduces a new Japanese word.
  - *Type the reading*: in kana or romaji (gakkou, がっこう and ガッコウ all count), checked automatically. Missing a long vowel or double consonant counts as "almost". A wrong answer can be overruled if it was only a typo.
  - *Listen*: your phone says the word, and you pick its meaning from four. This uses the device's built-in Japanese voice, and the exercise is skipped on devices without one.
  - *Fill the blank*: Chinese phrases are tested inside an example sentence, by picking from four phrases of the same length and kind (成语 among 成语). Built-in cards have a sentence, and your own phrases use the line you saved. After you answer, every option shows its pinyin and meaning.
- **A model decides what to review.** Memora uses half-life regression ([Settles & Meeder, 2016](https://aclanthology.org/P16-1174/), the model behind Duolingo's scheduling). Each card gets a memory half-life from its features (times right, times wrong, Chinese or Japanese, same meaning or false friend). A card is due once its predicted recall drops below 85%. The model's weights learn from every answer you give, so the predictions fit your memory over time.

Progress is saved in your browser. **Export reviews (CSV)** on the home screen downloads your full review log, ready for training a better model offline.

## Running it

```bash
npm install
npm run dev
```

Other commands: `npm test` runs the tests, and `npm run build` creates a static site in `dist/` that can be hosted anywhere (for example GitHub Pages).

## Code map

- `src/data/deck.ts`: the starter deck (about 70 Japanese words; about 55 Chinese words, 成语 and everyday phrases)
- `src/lib/model.ts`: half-life regression: features, predictions and online learning
- `src/lib/progress.ts`: per-card history, the review log and saving
- `src/lib/scheduler.ts`: builds each session from due cards and the daily allowance of new cards
- `src/lib/activities.ts`, `src/lib/answers.ts`, `src/lib/speech.ts`: picking an exercise, checking typed answers, Japanese text-to-speech
- `src/components/`: the home, study (with `activities.tsx` for each exercise), summary and add-a-phrase screens

## Next steps

- Import the full JLPT (N5–N1) and HSK word lists, linked by shared characters
- A kana trainer for complete beginners
- A Python notebook that trains the model on exported reviews and compares it with fixed spaced-repetition rules
- Example sentences and audio
