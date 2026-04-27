# English Coach — Equity Analyst Edition

Personal AI writing coach for an Italian native speaker training to write professional English in equity research / sell-side finance contexts.

## What it does

- **Editor** — Quill rich-text editor with real-time, debounced analysis. Three layers run on every pause:
  1. **Local Italian-trap scanner** — instant regex-based detection of false friends, calques, and preposition transfers (no API call).
  2. **LanguageTool** — free public grammar-and-style API.
  3. **Gemini 2.5 Flash** — deep tone, vocabulary, and finance-specific style coaching.
  Issues are underlined inline with category-coded colours and listed in the Insight Panel.

- **Vocabulary** — IndexedDB-backed personal lexicon with FSRS-lite spaced-repetition flashcards. 200+-term seed lexicon bundled.

- **Mirror Writing** — read a gold-standard paragraph for a timed period, then reproduce it. Gemini compares lexical / structural / idiomatic similarity, plus a token-level diff. Auto-saves missed phrases to vocabulary.

- **Earnings Drill** — write an 80-120 word analyst-style summary of an earnings transcript. Gemini scores accuracy, conciseness, style.

- **Reports** — templated multi-section report builder with per-section Gemini review and Markdown export.

- **Weekly Challenge** — Gemini-generated weekly prompt calibrated to your weakest categories.

- **Dashboard** — KPIs and charts (errors over time, by category, vocab by CEFR).

- **Import** — PDFs (research reports → corpus, parsed with PDF.js) and Excel files (vocabulary lists, parsed with SheetJS).

- **Settings** — tone, CEFR, dark mode, anonymizer toggle, JSON export/import, wipe.

- **Onboarding** — first-run placement test (3 writing samples → CEFR + gap areas).

## Architecture

- **No build step.** Pure HTML + JS via CDN.
- **Stack:** React 18 (UMD) + Babel standalone + Tailwind CSS (CDN) + Quill 2 + Recharts + PDF.js + SheetJS + IndexedDB.
- **APIs:** Google Gemini and free LanguageTool public endpoint.
- **Storage:** entirely local. Nothing leaves your machine except API calls (which can be anonymized).
- **PWA:** manifest + service worker for offline app shell.

## How to use

See `SETUP.md`.
