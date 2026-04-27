/**
 * MirrorWriting.js — read → hide → recall → compare exercise.
 *
 * Stages:
 *   1) select corpus chunk (from imported reports, or sample)
 *   2) study with timer
 *   3) recall (blank textarea)
 *   4) review with diff + Gemini comparison
 */
const { useState: useState_M, useEffect: useEffect_M } = React;

const SAMPLE_GOLD = [
  {
    title: 'Sample 1 — Earnings flash',
    text: `Q3 results came in slightly ahead of consensus, with revenue up 8% YoY and EBIT margin expanding 60bps to 18.4% on the back of operating leverage and easing input costs. Management nudged FY guidance higher, citing resilient demand in Europe and a faster-than-expected recovery in North America. We raise our FY EPS by 4% and lift our price target to EUR 52, implying 18% upside. Reiterate Buy.`
  },
  {
    title: 'Sample 2 — Sector view',
    text: `We turn more constructive on European banks, where capital returns are accelerating just as net interest income is set to plateau rather than collapse. Loan growth remains subdued, but cost-of-risk normalisation has been more orderly than feared, and CET1 ratios leave ample room for buybacks. Valuations, at ~7x forward earnings, look unchallenging. We upgrade two names to Overweight on the back of these dynamics.`
  },
  {
    title: 'Sample 3 — Risk paragraph',
    text: `Key risks to our thesis include a sharper-than-expected slowdown in consumer spending, regulatory intervention on pricing, and execution risk on the integration of recently acquired assets. A reversal of recent FX tailwinds could also weigh on reported growth, while a re-acceleration of input cost inflation would pressure gross margins, particularly in the lower-margin segments.`
  },
];

window.MirrorWriting = function MirrorWriting({ cefr }) {
  const [phase, setPhase] = useState_M('pick'); // pick | study | recall | review
  const [gold, setGold] = useState_M(null);
  const [studyTime, setStudyTime] = useState_M(60);
  const [timerLeft, setTimerLeft] = useState_M(0);
  const [userText, setUserText] = useState_M('');
  const [evaluation, setEvaluation] = useState_M(null);
  const [loading, setLoading] = useState_M(false);
  const [corpusChunks, setCorpusChunks] = useState_M([]);

  useEffect_M(() => { loadCorpus(); }, []);

  async function loadCorpus() {
    const chunks = await window.Storage.getAll('corpus');
    setCorpusChunks(chunks);
  }

  useEffect_M(() => {
    if (phase !== 'study' || timerLeft <= 0) return;
    const id = setInterval(() => setTimerLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [phase, timerLeft]);

  useEffect_M(() => {
    if (phase === 'study' && timerLeft === 0 && studyTime > 0) {
      setPhase('recall');
    }
  }, [timerLeft, phase, studyTime]);

  const pickGold = (g) => {
    setGold(g);
    setUserText('');
    setEvaluation(null);
    setTimerLeft(studyTime);
    setPhase('study');
  };

  const submitRecall = async () => {
    setLoading(true);
    try {
      const result = await window.Gemini.mirrorCompare({
        userText,
        originalText: gold.text,
        cefr,
      });
      setEvaluation(result);
      setPhase('review');

      // Auto-save "missed_phrasing" entries to vocabulary
      if (result && Array.isArray(result.missed_phrasing)) {
        for (const m of result.missed_phrasing) {
          if (!m.original) continue;
          const id = await window.Storage.add('vocabulary', {
            term: m.original,
            type: 'chunk',
            cefr,
            definition: m.why_better || '',
            italian: '',
            example: gold.text,
            category: 'mirror',
            createdAt: new Date().toISOString(),
          });
          await window.SRS.ensureCardForVocab(id);
        }
      }
    } catch (e) {
      alert('Comparison failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ---- PICK PHASE ----
  if (phase === 'pick') {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h2 className="text-2xl font-bold">Mirror Writing</h2>
        <p className="text-sm text-ink-500">
          Read a gold-standard paragraph carefully. Then it disappears. Reproduce it from memory in your own words.
          The system compares your version against the original and saves the phrases you missed to your vocabulary.
        </p>

        <div className="flex items-center gap-2 text-sm">
          <label>Study time:</label>
          <select
            value={studyTime}
            onChange={(e) => setStudyTime(Number(e.target.value))}
            className="px-2 py-1 rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800"
          >
            <option value="30">30s</option>
            <option value="60">1 min</option>
            <option value="90">1.5 min</option>
            <option value="120">2 min</option>
          </select>
        </div>

        <h3 className="text-sm font-semibold mt-4">Built-in samples</h3>
        <div className="grid gap-3">
          {SAMPLE_GOLD.map((g, i) => (
            <button
              key={i}
              onClick={() => pickGold(g)}
              className="text-left p-4 rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 hover:border-accent"
            >
              <div className="font-semibold">{g.title}</div>
              <div className="text-xs text-ink-500 mt-1 line-clamp-2">{g.text.slice(0, 140)}…</div>
            </button>
          ))}
        </div>

        {corpusChunks.length > 0 && (
          <>
            <h3 className="text-sm font-semibold mt-4">From your imported corpus</h3>
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {corpusChunks.slice(0, 30).map((c) => (
                <button
                  key={c.id}
                  onClick={() => pickGold({ title: `${c.title} — chunk ${c.chunkIndex + 1}`, text: c.text })}
                  className="text-left p-4 rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 hover:border-accent"
                >
                  <div className="font-semibold text-sm">{c.title}</div>
                  <div className="text-xs text-ink-500 mt-1 line-clamp-2">{c.text.slice(0, 140)}…</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ---- STUDY PHASE ----
  if (phase === 'study') {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{gold.title}</h2>
          <div className="text-sm">
            ⏱ <span className="font-mono">{Math.floor(timerLeft / 60)}:{String(timerLeft % 60).padStart(2, '0')}</span>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-lg leading-relaxed text-lg font-serif">
          {gold.text}
        </div>
        <button
          onClick={() => setPhase('recall')}
          className="px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover"
        >
          I'm ready — start recall
        </button>
      </div>
    );
  }

  // ---- RECALL PHASE ----
  if (phase === 'recall') {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h2 className="text-2xl font-bold">Recall: {gold.title}</h2>
        <p className="text-sm text-ink-500">Reproduce the paragraph from memory. Don't worry about being verbatim — capture the meaning and style.</p>
        <textarea
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Type your version here…"
          className="w-full p-4 rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 leading-relaxed"
          rows={10}
        />
        <div className="flex gap-2">
          <button
            onClick={submitRecall}
            disabled={loading || userText.length < 30}
            className="px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? 'Comparing…' : 'Submit & compare'}
          </button>
          <button
            onClick={() => setPhase('pick')}
            className="px-4 py-2 rounded bg-ink-100 dark:bg-ink-800 hover:bg-ink-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ---- REVIEW PHASE ----
  if (phase === 'review' && evaluation) {
    const diffParts = window.Diff.diff(gold.text, userText);
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h2 className="text-2xl font-bold">Review</h2>

        <div className="grid grid-cols-4 gap-3">
          <ScoreCard label="Overall" v={evaluation.overall_score} />
          <ScoreCard label="Structure" v={evaluation.structural_similarity_score} />
          <ScoreCard label="Lexical" v={evaluation.lexical_similarity_score} />
          <ScoreCard label="Idiomaticity" v={evaluation.idiomaticity_score} />
        </div>

        {evaluation.feedback && (
          <div className="p-4 rounded bg-accent/10 border border-accent/30 text-sm leading-relaxed">
            💬 {evaluation.feedback}
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold mb-2">Token-level diff</h3>
          <div className="p-4 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-lg leading-relaxed text-sm">
            {diffParts.map((p, i) => {
              if (p.type === 'equal') return <span key={i}>{p.text}</span>;
              if (p.type === 'delete') return <span key={i} className="diff-removed">{p.text}</span>;
              return <span key={i} className="diff-added">{p.text}</span>;
            })}
          </div>
          <div className="text-xs text-ink-500 mt-1">
            <span className="diff-removed">red strikethrough</span> = in original, missing from yours ·
            <span className="diff-added">green</span> = added in your version
          </div>
        </div>

        {evaluation.missed_phrasing && evaluation.missed_phrasing.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Phrases you should adopt (saved to vocab)</h3>
            <div className="space-y-2">
              {evaluation.missed_phrasing.map((m, i) => (
                <div key={i} className="p-3 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-sm">
                  <div className="font-semibold">{m.original}</div>
                  {m.user_version && <div className="text-xs text-ink-500 mt-1">You wrote: "{m.user_version}"</div>}
                  <div className="text-xs mt-1">{m.why_better}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {evaluation.kept_well && evaluation.kept_well.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">✅ You kept these well</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {evaluation.kept_well.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setPhase('pick')} className="px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover">
            New round
          </button>
        </div>
      </div>
    );
  }

  return null;
};

function ScoreCard({ label, v }) {
  return (
    <div className="p-3 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-center">
      <div className="text-2xl font-bold">{v != null ? v : '–'}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  );
}
