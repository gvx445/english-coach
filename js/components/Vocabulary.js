/**
 * Vocabulary.js — Vocabulary management + SRS flashcard review.
 */
const { useState: useState_V, useEffect: useEffect_V, useMemo: useMemo_V } = React;

window.Vocabulary = function Vocabulary() {
  const [vocab, setVocab] = useState_V([]);
  const [filter, setFilter] = useState_V('');
  const [typeFilter, setTypeFilter] = useState_V('all');
  const [mode, setMode] = useState_V('list'); // 'list' | 'review'
  const [dueCards, setDueCards] = useState_V([]);
  const [reviewIndex, setReviewIndex] = useState_V(0);
  const [flipped, setFlipped] = useState_V(false);
  const [reviewStats, setReviewStats] = useState_V({ done: 0, again: 0 });
  const [loading, setLoading] = useState_V(true);

  useEffect_V(() => { loadVocab(); }, []);

  async function loadVocab() {
    setLoading(true);
    const all = await window.Storage.getAll('vocabulary');
    setVocab(all.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
    setLoading(false);
  }

  async function importLexicon() {
    const existing = await window.Storage.getAll('vocabulary');
    const existingTerms = new Set(existing.map((v) => v.term.toLowerCase()));
    let imported = 0;
    for (const entry of window.FINANCE_LEXICON) {
      if (existingTerms.has(entry.term.toLowerCase())) continue;
      const id = await window.Storage.add('vocabulary', {
        ...entry,
        createdAt: new Date().toISOString(),
      });
      await window.SRS.ensureCardForVocab(id);
      imported++;
    }
    alert(`Imported ${imported} new terms.`);
    loadVocab();
  }

  async function deleteTerm(id) {
    if (!confirm('Delete this term?')) return;
    await window.Storage.remove('vocabulary', id);
    await window.Storage.remove('srs', id);
    loadVocab();
  }

  async function startReview() {
    const due = await window.SRS.getDueCards(30);
    if (due.length === 0) {
      alert('No cards due for review yet. Add more terms or come back later.');
      return;
    }
    // Hydrate with vocab data
    const cards = [];
    for (const c of due) {
      const v = await window.Storage.get('vocabulary', c.vocabId);
      if (v) cards.push({ ...c, vocab: v });
    }
    setDueCards(cards);
    setReviewIndex(0);
    setFlipped(false);
    setReviewStats({ done: 0, again: 0 });
    setMode('review');
  }

  async function rate(rating) {
    const current = dueCards[reviewIndex];
    if (!current) return;
    await window.SRS.recordReview(current.vocabId, rating);
    const newStats = {
      done: reviewStats.done + 1,
      again: reviewStats.again + (rating === 1 ? 1 : 0),
    };
    setReviewStats(newStats);
    if (reviewIndex + 1 >= dueCards.length) {
      alert(`Review done! ${newStats.done} cards, ${newStats.again} marked Again.`);
      setMode('list');
      loadVocab();
    } else {
      setReviewIndex(reviewIndex + 1);
      setFlipped(false);
    }
  }

  const filtered = useMemo_V(() => {
    return vocab.filter((v) => {
      if (typeFilter !== 'all' && v.type !== typeFilter) return false;
      if (!filter) return true;
      const f = filter.toLowerCase();
      return (
        (v.term || '').toLowerCase().includes(f) ||
        (v.italian || '').toLowerCase().includes(f) ||
        (v.definition || '').toLowerCase().includes(f)
      );
    });
  }, [vocab, filter, typeFilter]);

  if (mode === 'review') {
    const c = dueCards[reviewIndex];
    if (!c) return null;
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between text-sm text-ink-500">
          <span>Card {reviewIndex + 1} / {dueCards.length}</span>
          <button onClick={() => setMode('list')} className="text-xs px-2 py-1 rounded bg-ink-100 dark:bg-ink-800 hover:bg-ink-200">
            End review
          </button>
        </div>
        <div
          className={`flashcard ${flipped ? 'flipped' : ''} cursor-pointer`}
          onClick={() => setFlipped(!flipped)}
          style={{ minHeight: 280 }}
        >
          <div className="flashcard-inner relative" style={{ minHeight: 280 }}>
            <div className="flashcard-face absolute inset-0 bg-white dark:bg-ink-800 border-2 border-ink-200 dark:border-ink-700 rounded-xl p-8 flex flex-col items-center justify-center">
              <div className="text-xs uppercase tracking-wider text-ink-400 mb-2">{c.vocab.type} · {c.vocab.cefr}</div>
              <div className="text-3xl font-serif text-ink-900 dark:text-ink-100 text-center">{c.vocab.term}</div>
              <div className="text-xs text-ink-400 mt-6">tap to flip</div>
            </div>
            <div className="flashcard-face flashcard-back absolute inset-0 bg-ink-50 dark:bg-ink-900 border-2 border-ink-200 dark:border-ink-700 rounded-xl p-6 flex flex-col justify-center">
              <div className="text-sm leading-relaxed mb-2">{c.vocab.definition}</div>
              {c.vocab.italian && <div className="text-sm text-ink-500 mb-2">🇮🇹 {c.vocab.italian}</div>}
              {c.vocab.example && <div className="text-sm italic border-l-2 border-accent pl-3">"{c.vocab.example}"</div>}
            </div>
          </div>
        </div>
        {flipped && (
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => rate(1)} className="py-3 rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200">
              <div className="text-sm font-semibold">Again</div>
              <div className="text-xs opacity-70">&lt; 1m</div>
            </button>
            <button onClick={() => rate(2)} className="py-3 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 hover:bg-amber-200">
              <div className="text-sm font-semibold">Hard</div>
              <div className="text-xs opacity-70">~10m</div>
            </button>
            <button onClick={() => rate(3)} className="py-3 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200">
              <div className="text-sm font-semibold">Good</div>
              <div className="text-xs opacity-70">~1d</div>
            </button>
            <button onClick={() => rate(4)} className="py-3 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200">
              <div className="text-sm font-semibold">Easy</div>
              <div className="text-xs opacity-70">~3d</div>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h2 className="text-2xl font-bold">Vocabulary</h2>
        <div className="flex gap-2 flex-wrap">
          <button onClick={importLexicon} className="text-sm px-3 py-1.5 rounded bg-ink-100 dark:bg-ink-800 hover:bg-ink-200">
            📥 Import seed lexicon (200+ finance terms)
          </button>
          <button onClick={startReview} className="text-sm px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover">
            🃏 Review due
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search…"
          className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800"
        >
          <option value="all">All types</option>
          <option value="word">Word</option>
          <option value="idiom">Idiom</option>
          <option value="chunk">Chunk</option>
          <option value="collocation">Collocation</option>
          <option value="phrasal_verb">Phrasal verb</option>
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-ink-500">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-ink-500">
          <p>No terms yet.</p>
          <p className="text-xs mt-2">Click "Import seed lexicon" or save terms from the Editor's Insights → Vocab tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((v) => (
            <div key={v.id} className="border border-ink-200 dark:border-ink-700 rounded p-3 bg-white dark:bg-ink-800">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-semibold">{v.term}</div>
                  <div className="text-xs text-ink-400">{v.type} · {v.cefr || '–'}</div>
                </div>
                <button
                  onClick={() => deleteTerm(v.id)}
                  className="text-xs text-ink-400 hover:text-red-500"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
              {v.definition && <div className="text-sm mt-1">{v.definition}</div>}
              {v.italian && <div className="text-sm text-ink-500">🇮🇹 {v.italian}</div>}
              {v.example && <div className="text-xs italic mt-1 text-ink-600 dark:text-ink-400">"{v.example}"</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
