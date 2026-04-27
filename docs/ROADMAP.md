# Roadmap

## Sprint 1 — DONE ✅
- HTML+JS no-build foundation (React UMD + Babel standalone + Tailwind CDN + Quill)
- IndexedDB storage layer
- Gemini API wrapper (generate, embed, all high-level methods)
- LanguageTool wrapper
- 200+-term seed finance lexicon
- Italian-traps regex database (~50 patterns)
- 3-layer analysis pipeline in the Editor
- Insight Panel with categories, "Why?" explanations, "Apply" fixes, save-to-vocab
- FSRS-lite SRS for vocabulary
- Mirror Writing (with diff)
- Earnings Drill
- Report Builder (Initiation / Update / Earnings flash templates)
- Weekly Challenge (LLM-generated, calibrated to weak areas)
- Dashboard (Recharts)
- Import (PDF.js + SheetJS)
- Settings + backup/restore
- Onboarding placement test
- PWA manifest + service worker
- Anonymizer (tickers, money amounts)

## Sprint 2 — Suggested next
- Better Excel column heuristics (header detection: term / italian / definition / example / cefr)
- Italian Interference dedicated tab (run dedicated prompt, not just embedded in main analyze)
- Apply-fix actually modifies Quill content (currently dispatches event but Editor doesn't listen — TODO)
- Corpus-aware writing suggestions (use RAG to inject relevant examples from your imported reports into the analysis prompt)
- Phrasebook view (filter vocab to only "chunks" + "collocations" — like the chunks playbook)
- Pronunciation drills (out of scope for written English but could be added)
- Keyboard shortcuts (cmd-S save, cmd-K command palette)
- Better mobile editor UX (Quill is desktop-first)
- Statistics export (CSV) for tracking progress over time
- Self-hosted LanguageTool fallback (Docker one-liner)

## Sprint 3 — Stretch
- Voice-to-text dictation → transcript → editor
- Bilingual corpus alignment (Italian-English parallel sentences from your imports)
- Adversarial mode: Gemini argues against your thesis to teach defence
- Style transfer: paste any text, get it rewritten in 4 different sell-side voices (GS, MS, JPM, BARC) — comparative learning
