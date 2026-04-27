/**
 * InsightPanel.js — right-side panel showing analysis results.
 */
const { useState: useState_IP, useEffect: useEffect_IP } = React;

window.InsightPanel = function InsightPanel({ analysis, text, tone, cefr, onApplyFix }) {
  const [tab, setTab] = useState_IP('issues');
  const [explanations, setExplanations] = useState_IP({});
  const [loadingExplain, setLoadingExplain] = useState_IP({});
  const [rewrites, setRewrites] = useState_IP(null);
  const [loadingRewrite, setLoadingRewrite] = useState_IP(false);

  const issues = (analysis && analysis.issues) || [];
  const llm = analysis && analysis.llm;

  const grouped = {
    grammar: issues.filter((i) => i.category === 'grammar'),
    style: issues.filter((i) => i.category === 'style'),
    vocabulary: issues.filter((i) => i.category === 'vocabulary'),
    tone: issues.filter((i) => i.category === 'tone'),
    italian_interference: issues.filter((i) => i.category === 'italian_interference'),
  };

  const colorClass = {
    grammar: 'border-red-400 bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200',
    style: 'border-blue-400 bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-200',
    vocabulary: 'border-purple-400 bg-purple-50 dark:bg-purple-900/10 text-purple-800 dark:text-purple-200',
    tone: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-200',
    italian_interference: 'border-amber-400 bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-200',
  };

  const labelMap = {
    grammar: 'Grammar',
    style: 'Style',
    vocabulary: 'Vocabulary',
    tone: 'Tone',
    italian_interference: '🇮🇹 Italian interference',
  };

  const explainIssue = async (idx, issue) => {
    if (explanations[idx]) return;
    setLoadingExplain((s) => ({ ...s, [idx]: true }));
    try {
      const res = await window.Gemini.explainIssue({
        original: issue.original,
        correction: issue.suggestion,
        category: issue.category,
        cefr,
      });
      setExplanations((s) => ({ ...s, [idx]: res }));
    } catch (e) {
      setExplanations((s) => ({ ...s, [idx]: { error: e.message } }));
    } finally {
      setLoadingExplain((s) => ({ ...s, [idx]: false }));
    }
  };

  const saveToVocab = async (vocab) => {
    try {
      const id = await window.Storage.add('vocabulary', {
        term: vocab.term,
        type: vocab.type || 'word',
        cefr: vocab.cefr || cefr,
        definition: vocab.definition || '',
        italian: vocab.italian || '',
        example: vocab.example || '',
        category: 'auto',
        createdAt: new Date().toISOString(),
      });
      await window.SRS.ensureCardForVocab(id);
      alert(`Saved "${vocab.term}" to vocabulary.`);
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
  };

  const requestRewrite = async (mode) => {
    if (!text || text.length < 30) return;
    setLoadingRewrite(true);
    try {
      const r = await window.Gemini.rewriteText({ text, tone, mode });
      setRewrites(r);
      setTab('rewrites');
    } catch (e) {
      alert('Rewrite failed: ' + e.message);
    } finally {
      setLoadingRewrite(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-lg">
      <div className="border-b border-ink-200 dark:border-ink-700 p-3 flex gap-2 flex-wrap">
        {['issues', 'summary', 'vocab', 'rewrites'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              tab === t
                ? 'bg-accent text-white'
                : 'bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300 hover:bg-ink-200'
            }`}
          >
            {t === 'issues' ? `Issues (${issues.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {tab === 'issues' && (
          <>
            {issues.length === 0 ? (
              <div className="text-sm text-ink-500 italic p-4 text-center">
                Write at least 30 characters and pause to see analysis.
              </div>
            ) : (
              Object.keys(grouped).map((cat) =>
                grouped[cat].length === 0 ? null : (
                  <div key={cat}>
                    <h3 className="text-xs uppercase tracking-wider text-ink-500 mb-2 px-1">
                      {labelMap[cat]} ({grouped[cat].length})
                    </h3>
                    <div className="space-y-2">
                      {grouped[cat].map((iss, i) => {
                        const idx = `${cat}-${i}`;
                        const exp = explanations[idx];
                        return (
                          <div
                            key={idx}
                            className={`insight-card border-l-4 ${colorClass[cat]} rounded p-3 text-sm`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1">
                                <div className="line-through opacity-70">{iss.original}</div>
                                <div className="font-semibold mt-1">→ {iss.suggestion}</div>
                              </div>
                            </div>
                            {iss.rule && <div className="text-xs opacity-75 mt-1">📘 {iss.rule}</div>}
                            {iss.explanation && (
                              <div className="text-xs opacity-90 mt-2">{iss.explanation}</div>
                            )}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {iss.suggestion && (
                                <button
                                  onClick={() => onApplyFix && onApplyFix(iss)}
                                  className="text-xs px-2 py-1 rounded bg-white dark:bg-ink-700 hover:bg-ink-50 dark:hover:bg-ink-600 border border-ink-200 dark:border-ink-600"
                                >
                                  ✓ Apply
                                </button>
                              )}
                              <button
                                onClick={() => explainIssue(idx, iss)}
                                className="text-xs px-2 py-1 rounded bg-white dark:bg-ink-700 hover:bg-ink-50 dark:hover:bg-ink-600 border border-ink-200 dark:border-ink-600"
                              >
                                {loadingExplain[idx] ? '…' : 'Why?'}
                              </button>
                              <span className="text-xs opacity-50 ml-auto">{iss.source}</span>
                            </div>
                            {exp && !exp.error && (
                              <div className="mt-3 p-2 rounded bg-white/60 dark:bg-ink-900/30 text-xs space-y-1">
                                <div><span className="font-semibold">Rule:</span> {exp.rule}</div>
                                <div><span className="font-semibold">Why wrong:</span> {exp.why_wrong}</div>
                                <div><span className="font-semibold">Why correct:</span> {exp.why_correct}</div>
                                {exp.italian_perspective && (
                                  <div><span className="font-semibold">🇮🇹 Italian perspective:</span> {exp.italian_perspective}</div>
                                )}
                                {exp.more_examples && exp.more_examples.length > 0 && (
                                  <div>
                                    <div className="font-semibold">More examples:</div>
                                    <ul className="list-disc list-inside ml-1">
                                      {exp.more_examples.map((ex, k) => <li key={k}>{ex}</li>)}
                                    </ul>
                                  </div>
                                )}
                                {exp.remember_tip && (
                                  <div className="mt-1 italic">💡 {exp.remember_tip}</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )
            )}
          </>
        )}

        {tab === 'summary' && (
          <div className="space-y-3">
            {!llm ? (
              <div className="text-sm text-ink-500 italic">No analysis yet. Keep writing.</div>
            ) : (
              <>
                <div className="flex gap-3">
                  <div className="flex-1 p-3 rounded bg-ink-50 dark:bg-ink-900 text-center">
                    <div className="text-2xl font-bold">{llm.overall_score || '–'}</div>
                    <div className="text-xs text-ink-500">Overall</div>
                  </div>
                  <div className="flex-1 p-3 rounded bg-ink-50 dark:bg-ink-900 text-center">
                    <div className="text-2xl font-bold">{llm.tone_match_score || '–'}</div>
                    <div className="text-xs text-ink-500">Tone match</div>
                  </div>
                </div>
                <div className="text-sm leading-relaxed">{llm.summary}</div>
              </>
            )}
          </div>
        )}

        {tab === 'vocab' && (
          <div className="space-y-2">
            {!llm || !llm.vocabulary_to_save || llm.vocabulary_to_save.length === 0 ? (
              <div className="text-sm text-ink-500 italic">No vocabulary suggestions yet.</div>
            ) : (
              llm.vocabulary_to_save.map((v, i) => (
                <div key={i} className="border border-ink-200 dark:border-ink-700 rounded p-3 text-sm">
                  <div className="font-semibold">{v.term} <span className="text-xs text-ink-400">{v.type} · {v.cefr}</span></div>
                  <div className="text-xs text-ink-500 mt-1">{v.definition}</div>
                  {v.italian && <div className="text-xs text-ink-500">🇮🇹 {v.italian}</div>}
                  {v.example && <div className="text-xs italic mt-1">"{v.example}"</div>}
                  <button
                    onClick={() => saveToVocab(v)}
                    className="mt-2 text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 hover:bg-purple-200"
                  >
                    + Save to vocabulary
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'rewrites' && (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {['polish', 'tighten', 'strengthen', 'simplify'].map((m) => (
                <button
                  key={m}
                  onClick={() => requestRewrite(m)}
                  disabled={loadingRewrite}
                  className="text-xs px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50"
                >
                  {loadingRewrite ? '…' : m}
                </button>
              ))}
            </div>
            {rewrites && (
              <>
                <div className="text-xs italic text-ink-500">{rewrites.changes_summary}</div>
                {(rewrites.alternatives || []).map((alt, i) => (
                  <div key={i} className="border border-ink-200 dark:border-ink-700 rounded p-3 text-sm">
                    <div className="text-xs text-ink-500 mb-1">Alternative {i + 1}</div>
                    <div className="leading-relaxed">{alt}</div>
                    <button
                      onClick={() => navigator.clipboard.writeText(alt)}
                      className="mt-2 text-xs px-2 py-1 rounded bg-ink-100 dark:bg-ink-700 hover:bg-ink-200"
                    >
                      📋 Copy
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
