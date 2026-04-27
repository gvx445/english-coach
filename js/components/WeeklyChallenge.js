/**
 * WeeklyChallenge.js — generated weekly writing prompts.
 */
const { useState: useState_WC, useEffect: useEffect_WC } = React;

window.WeeklyChallenge = function WeeklyChallenge({ cefr }) {
  const [challenge, setChallenge] = useState_WC(null);
  const [history, setHistory] = useState_WC([]);
  const [loading, setLoading] = useState_WC(false);
  const [submission, setSubmission] = useState_WC('');
  const [evaluation, setEvaluation] = useState_WC(null);
  const [reviewing, setReviewing] = useState_WC(false);

  useEffect_WC(() => { loadHistory(); }, []);

  async function loadHistory() {
    const all = await window.Storage.getAll('documents');
    setHistory(all.filter((d) => d.kind === 'challenge').sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
    const last = await window.Storage.getSetting('lastChallenge');
    if (last) {
      setChallenge(last);
      setSubmission(last.userSubmission || '');
      setEvaluation(last.evaluation || null);
    }
  }

  async function generate() {
    setLoading(true);
    try {
      const errors = await window.Storage.getAll('errors');
      const recent = errors.slice(-100);
      const counts = {};
      recent.forEach((e) => { counts[e.category] = (counts[e.category] || 0) + 1; });
      const weakAreas = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);

      const ch = await window.Gemini.generateChallenge({ cefr, weakAreas });
      const enriched = { ...ch, generatedAt: new Date().toISOString() };
      setChallenge(enriched);
      setSubmission('');
      setEvaluation(null);
      await window.Storage.setSetting('lastChallenge', enriched);
    } catch (e) {
      alert('Failed to generate: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitForReview() {
    if (!challenge || submission.length < 80) {
      alert('Write at least 80 characters before submitting.');
      return;
    }
    setReviewing(true);
    try {
      const result = await window.Gemini.analyzeWriting({
        text: submission, tone: 'equity_analyst', cefr,
      });
      setEvaluation(result);
      const updated = { ...challenge, userSubmission: submission, evaluation: result, completedAt: new Date().toISOString() };
      setChallenge(updated);
      await window.Storage.setSetting('lastChallenge', updated);
      await window.Storage.add('documents', {
        kind: 'challenge',
        title: challenge.title,
        text: submission,
        evaluation: result,
        createdAt: new Date().toISOString(),
      });
      loadHistory();
    } catch (e) {
      alert('Review failed: ' + e.message);
    } finally {
      setReviewing(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Weekly Challenge</h2>
        <button onClick={generate} disabled={loading}
          className="px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover text-sm disabled:opacity-50">
          {loading ? 'Generating…' : '🎲 New challenge'}
        </button>
      </div>

      {!challenge ? (
        <div className="p-8 text-center text-ink-500">
          <p>No challenge yet. Click "New challenge" to start.</p>
        </div>
      ) : (
        <>
          <div className="p-4 rounded bg-white dark:bg-ink-800 border-2 border-accent space-y-3">
            <h3 className="text-lg font-bold">{challenge.title}</h3>
            <div className="text-xs text-ink-500 uppercase tracking-wider">{challenge.type}</div>
            <p className="text-sm leading-relaxed">{challenge.prompt}</p>
            {challenge.context && (
              <div className="text-sm p-3 rounded bg-ink-50 dark:bg-ink-900">
                <span className="font-semibold">Context: </span>{challenge.context}
              </div>
            )}
            {challenge.constraints && challenge.constraints.length > 0 && (
              <div>
                <div className="text-sm font-semibold">Constraints</div>
                <ul className="list-disc list-inside text-sm">
                  {challenge.constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
            {challenge.vocab_to_use && challenge.vocab_to_use.length > 0 && (
              <div>
                <div className="text-sm font-semibold">Vocab to incorporate</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {challenge.vocab_to_use.map((v, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <textarea
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            placeholder="Write your response here…"
            className="w-full p-4 rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-sm leading-relaxed"
            rows={10}
          />
          <div className="flex justify-between">
            <span className="text-xs text-ink-500">{submission.split(/\s+/).filter(Boolean).length} words</span>
            <button onClick={submitForReview} disabled={reviewing}
              className="px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover text-sm disabled:opacity-50">
              {reviewing ? 'Reviewing…' : '📤 Submit'}
            </button>
          </div>

          {evaluation && (
            <div className="p-4 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 text-center p-2 rounded bg-ink-50 dark:bg-ink-900">
                  <div className="text-2xl font-bold">{evaluation.overall_score || '–'}</div>
                  <div className="text-xs text-ink-500">Overall</div>
                </div>
                <div className="flex-1 text-center p-2 rounded bg-ink-50 dark:bg-ink-900">
                  <div className="text-2xl font-bold">{evaluation.tone_match_score || '–'}</div>
                  <div className="text-xs text-ink-500">Tone match</div>
                </div>
              </div>
              <div className="text-sm">{evaluation.summary}</div>
            </div>
          )}
        </>
      )}

      {history.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-semibold">Past challenges ({history.length})</summary>
          <div className="mt-2 space-y-2">
            {history.slice(0, 10).map((h) => (
              <div key={h.id} className="p-2 rounded border border-ink-200 dark:border-ink-700 text-sm">
                <div className="font-semibold">{h.title}</div>
                <div className="text-xs text-ink-500">
                  {new Date(h.createdAt).toLocaleDateString()} · {h.evaluation && h.evaluation.overall_score ? `${h.evaluation.overall_score}/100` : '–'}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};
