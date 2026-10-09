# Memora

Learn Japanese and keep your Chinese sharp. Memora predicts when you are about to forget each word and brings it back just before you do.

## How it works

- **Japanese builds on your Chinese.** Every Japanese card says how it relates to Chinese:
  - *same meaning*, e.g. 学生 (gakusei / xuésheng)
  - *false friend*, e.g. 手紙 is "letter" in Japanese but 手纸 is "toilet paper" in Chinese
  - *different word*, e.g. 友達 (tomodachi) where Chinese says 朋友
- **Chinese stays in maintenance.** About 20% of each session goes to advanced Chinese words and 成语. You see the meaning and pinyin and write the characters, to fight 提笔忘字.
- **A model decides what to review.** Memora uses half-life regression ([Settles & Meeder, 2016](https://aclanthology.org/P16-1174/), the model behind Duolingo's scheduling). Each card gets a memory half-life from its features (times right, times wrong, Chinese or Japanese, same meaning or false friend). A card is due once its predicted recall drops below 85%. The model's weights learn from every answer you give, so the predictions fit your memory over time.

Progress is saved in your browser. **Export reviews (CSV)** on the home screen downloads your full review log, ready for training a better model offline.

## Running it

```bash
npm install
npm run dev
```

Other commands: `npm test` runs the tests, and `npm run build` creates a static site in `dist/` that can be hosted anywhere (for example GitHub Pages).

## Code map

- `src/data/deck.ts`: the starter deck (about 70 Japanese words, about 40 Chinese words and 成语)
- `src/lib/model.ts`: half-life regression: features, predictions and online learning
- `src/lib/progress.ts`: per-card history, the review log and saving
- `src/lib/scheduler.ts`: builds each session from due cards and the daily allowance of new cards
- `src/components/`: the home, study and summary screens

## Next steps

- Import the full JLPT (N5–N1) and HSK word lists, linked by shared characters
- A kana trainer for complete beginners
- A Python notebook that trains the model on exported reviews and compares it with fixed spaced-repetition rules
- Example sentences and audio
