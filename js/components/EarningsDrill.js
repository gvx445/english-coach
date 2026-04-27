/**
 * EarningsDrill.js — pick a transcript → write a summary → Gemini scores it.
 */
const { useState: useState_ED, useEffect: useEffect_ED } = React;

const SAMPLE_TRANSCRIPT = {
  title: 'Acme Corp Q3 2024 — selected highlights',
  text: `[CFO] We delivered another quarter of solid execution, with revenue growth of 9% YoY at constant currency, gross margin up 70 basis points to 42.8%, and operating margin reaching 18.1%, comfortably ahead of our internal plan. Cash conversion was strong at 105% of net income, and we ended the quarter with net debt of EUR 1.2 billion, or 1.4 times EBITDA.

[CEO] Looking at the segments, our Industrial division grew 11%, with pricing contributing roughly two-thirds and volumes one-third. Demand in Europe remained resilient despite the slower macro backdrop, while North America surprised positively, particularly in the second half of the quarter. China was a clear soft spot — orders declined 6% — but we believe inventories are now closer to normal and we expect a more constructive picture from Q1.

[CFO] Looking forward, we are raising our full-year guidance. We now expect organic revenue growth of 7-8% versus the prior 5-7%, and EBIT margin of 17.5-18% versus 16.5-17.5%. We are also accelerating our buyback programme and have launched an additional EUR 500 million tranche to be completed by mid-2025.

[Analyst Q&A] One question on capital allocation. Are you considering a bolt-on acquisition in the specialty chemicals space?
[CEO] We continue to evaluate opportunities. The bar remains high — we will only deploy capital where we see clear strategic fit and accretion within 24 months.`,
};

window.EarningsDrill = function EarningsDrill({ cefr }) {
  const [phase, setPhase] = useState_ED('pick'); // pick | write | review
  const [transcript, setTranscript] = useState_ED(SAMPLE_TRANSCRIPT);
  const [summary, setSummary] = useState_ED('');
  const [evaluation, setEvaluation] = useState_ED(null);
  const [loading, setLoading] = useState_ED(false);
  const [customText, setCustomText] = useState_ED('');

  const useCustom = () => {
    if (customText.length < 200) {
      alert('Paste a transcript of at least 200 characters.');
      return;
    }
    setTranscript({ title: 'Custom transcript', text: customText });
    setPhase('write');
    setSummary('');
    setEvaluation(null);
  };

  const useSample = () => {
    setTranscript(SAMPLE_TRANSCRIPT);
    setPhase('write');
    setSummary('');
    setEvaluation(null);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const result = await window.Gemini.earningsScore({
        summary, transcript: transcript.text, cefr,
      });
      setEvaluation(result);
      setPhase('review');
    } catch (e) {
      alert('Scoring failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'pick') {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h2 className="text-2xl font-bold">Earnings Drill</h2>
        <p className="text-sm text-ink-500">
          You read an earnings call excerpt, then write a tight 80-120 word analyst-style summary.
          Gemini scores it on accuracy, conciseness, and style — and shows you a model summary.
        </p>

        <div className="p-4 border border-ink-200 dark:border-ink-700 rounded bg-white dark:bg-ink-800">
          <h3 className="font-semibold">Built-in sample</h3>
          <p className="text-xs text-ink-500 mt-1">{SAMPLE_TRANSCRIPT.title}</p>
          <button onClick={useSample} className="mt-3 px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover text-sm">
            Use this sample
          </button>
        </div>

        <div className="p-4 border border-ink-200 dark:border-ink-700 rounded bg-white dark:bg-ink-800 space-y-2">
          <h3 className="font-semibold">Or paste your own transcript</h3>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Paste an earnings transcript or excerpt here…"
            className="w-full p-3 rounded border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-sm"
            rows={8}
          />
          <button onClick={useCustom} className="px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover text-sm">
            Use custom
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'write') {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h2 className="text-2xl font-bold">{transcript.title}</h2>
        <details open className="p-4 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded">
          <summary className="cursor-pointer font-semibold text-sm">Transcript</summary>
          <div className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{transcript.text}</div>
        </details>

        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Write your 80-120 word analyst-style summary here. Focus on key numbers, drivers, guidance change, and a clear takeaway."
          className="w-full p-4 rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-sm leading-relaxed"
          rows={8}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-ink-500">{summary.split(/\s+/).filter(Boolean).length} words</span>
          <div className="flex gap-2">
            <button onClick={() => setPhase('pick')} className="px-3 py-1.5 rounded bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 text-sm">
              Back
            </button>
            <button
              onClick={submit}
              disabled={loading || summary.length < 80}
              className="px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50 text-sm"
            >
              {loading ? 'Scoring…' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'review' && evaluation) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h2 className="text-2xl font-bold">Score</h2>

        <div className="grid grid-cols-4 gap-3">
          <ScoreCardED label="Overall" v={evaluation.overall_score} />
          <ScoreCardED label="Accuracy" v={evaluation.accuracy_score} />
          <ScoreCardED label="Concise" v={evaluation.conciseness_score} />
          <ScoreCardED label="Style" v={evaluation.analyst_style_score} />
        </div>

        {evaluation.feedback && (
          <div className="p-4 rounded bg-accent/10 border border-accent/30 text-sm">💬 {evaluation.feedback}</div>
        )}

        {evaluation.missed_key_points && evaluation.missed_key_points.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">⚠ Missed key points</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {evaluation.missed_key_points.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        )}

        {evaluation.false_claims && evaluation.false_claims.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2 text-red-600">❌ Claims not in transcript</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {evaluation.false_claims.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        )}

        {evaluation.language_issues && evaluation.language_issues.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Language polish</h3>
            <div className="space-y-2">
              {evaluation.language_issues.map((m, i) => (
                <div key={i} className="p-3 rounded border border-ink-200 dark:border-ink-700 text-sm">
                  <div className="line-through opacity-60">{m.original}</div>
                  <div className="font-semibold">→ {m.suggestion}</div>
                  <div className="text-xs text-ink-500 mt-1">{m.why}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {evaluation.model_summary && (
          <div>
            <h3 className="text-sm font-semibold mb-2">📋 Model summary (compare with yours)</h3>
            <div className="p-4 rounded bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700/30 text-sm leading-relaxed">
              {evaluation.model_summary}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold mb-2">Your version</h3>
          <div className="p-4 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-sm leading-relaxed">
            {summary}
          </div>
        </div>

        <button onClick={() => setPhase('pick')} className="px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover">
          New drill
        </button>
      </div>
    );
  }
  return null;
};

function ScoreCardED({ label, v }) {
  return (
    <div className="p-3 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-center">
      <div className="text-2xl font-bold">{v != null ? v : '–'}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  );
}
