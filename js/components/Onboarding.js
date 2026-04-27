/**
 * Onboarding.js — first-run placement test.
 */
const { useState: useState_O } = React;

const PROMPTS_PT = [
  {
    id: 'q1',
    title: 'Quick context (warm-up)',
    body: 'In 3-4 sentences, describe your role, your goal for using this tool, and your biggest writing challenge in English.'
  },
  {
    id: 'q2',
    title: 'Summarise an event',
    body: 'In 5-6 sentences, summarise this scenario in analyst-style English: "Acme Corp reported Q3 revenue of EUR 1.2bn (+9% YoY), EBIT margin of 18%, raised FY guidance, and announced a EUR 500m buyback. Demand was strong in Europe and the US, but China declined 6%."'
  },
  {
    id: 'q3',
    title: 'Argument',
    body: 'In a short paragraph (4-5 sentences), defend OR attack this view: "European banks are entering a structurally more profitable era thanks to higher rates and rising capital returns."'
  },
];

window.Onboarding = function Onboarding({ onDone }) {
  const [step, setStep] = useState_O(0);
  const [answers, setAnswers] = useState_O({});
  const [result, setResult] = useState_O(null);
  const [loading, setLoading] = useState_O(false);

  if (step === PROMPTS_PT.length + 1 && result) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <h2 className="text-2xl font-bold">Your profile</h2>
        <div className="p-4 rounded bg-accent/10 border border-accent/30 text-sm">
          {result.personalised_intro_message}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700">
            <div className="text-xs uppercase tracking-wider text-ink-500">Estimated CEFR</div>
            <div className="text-3xl font-bold">{result.estimated_cefr}</div>
            <div className="text-xs text-ink-500">{result.confidence}% confidence</div>
          </div>
          <div className="p-4 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700">
            <div className="text-xs uppercase tracking-wider text-ink-500">Recommended focus</div>
            <ul className="text-sm mt-1 list-disc list-inside">
              {(result.recommended_focus || []).map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        </div>
        {result.gap_areas && result.gap_areas.length > 0 && (
          <div className="p-4 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700">
            <h3 className="font-semibold mb-2">Gap areas</h3>
            <ul className="space-y-2 text-sm">
              {result.gap_areas.map((g, i) => (
                <li key={i}>
                  <span className={`text-xs px-1.5 py-0.5 rounded mr-2 ${g.severity === 'high' ? 'bg-red-100 text-red-800' : g.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {g.severity}
                  </span>
                  <span className="font-semibold">{g.area}</span>
                  {g.evidence && <div className="text-xs text-ink-500 italic ml-12">"{g.evidence}"</div>}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={() => onDone(result.estimated_cefr || 'B2')}
          className="w-full py-3 rounded bg-accent text-white hover:bg-accent-hover font-semibold"
        >
          Start coaching →
        </button>
      </div>
    );
  }

  if (step >= PROMPTS_PT.length) {
    if (!loading) {
      setLoading(true);
      window.Gemini.placementTest({
        samples: PROMPTS_PT.map((p) => answers[p.id] || ''),
      }).then((r) => {
        setResult(r);
        setStep(PROMPTS_PT.length + 1);
      }).catch((e) => {
        alert('Placement failed: ' + e.message);
        setLoading(false);
      });
    }
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4 text-center">
        <h2 className="text-2xl font-bold">Analysing your samples…</h2>
        <div className="shimmer h-32 rounded"></div>
      </div>
    );
  }

  const current = PROMPTS_PT[step];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="text-xs text-ink-500">Step {step + 1} of {PROMPTS_PT.length}</div>
      <h2 className="text-2xl font-bold">{current.title}</h2>
      <p className="text-sm text-ink-600 dark:text-ink-300">{current.body}</p>
      <textarea
        value={answers[current.id] || ''}
        onChange={(e) => setAnswers({ ...answers, [current.id]: e.target.value })}
        placeholder="Write here in English…"
        className="w-full p-4 rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-sm leading-relaxed"
        rows={8}
      />
      <div className="flex justify-between items-center">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="text-sm px-3 py-1.5 rounded bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          onClick={() => setStep(step + 1)}
          disabled={!(answers[current.id] && answers[current.id].length >= 30)}
          className="text-sm px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {step === PROMPTS_PT.length - 1 ? 'Submit →' : 'Next →'}
        </button>
      </div>
    </div>
  );
};
