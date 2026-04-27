/**
 * ReportBuilder.js — templated report builder with per-section Gemini review.
 */
const { useState: useState_RB, useEffect: useEffect_RB } = React;

const TEMPLATES = {
  initiation: {
    name: 'Initiation of coverage',
    sections: [
      { id: 'thesis', label: 'Investment thesis (3-4 sentences)', placeholder: 'We initiate coverage of XYZ with [Buy/Hold/Sell] and a EUR XX price target. Our thesis rests on [3 pillars]…', minWords: 60 },
      { id: 'company', label: 'Company description', placeholder: 'Brief overview of business model, segments, and geography.', minWords: 80 },
      { id: 'drivers', label: 'Key drivers', placeholder: 'Top 3-4 drivers with quantification.', minWords: 80 },
      { id: 'valuation', label: 'Valuation', placeholder: 'Methodology, multiples vs peers, fair value.', minWords: 80 },
      { id: 'risks', label: 'Risks', placeholder: 'Key downside risks and what would change our view.', minWords: 60 },
    ]
  },
  earnings_flash: {
    name: 'Earnings flash',
    sections: [
      { id: 'headline', label: 'Headline (1 sentence)', placeholder: 'XYZ beat consensus on revenue and EBIT, with management nudging FY guidance higher.', minWords: 15 },
      { id: 'numbers', label: 'Numbers vs consensus', placeholder: 'Revenue, EBIT, EPS — actual vs consensus, drivers of variance.', minWords: 60 },
      { id: 'guidance', label: 'Guidance', placeholder: 'Updated guidance and what it implies.', minWords: 40 },
      { id: 'takeaway', label: 'Our take', placeholder: 'What changes (estimates, PT, rating).', minWords: 60 },
    ]
  },
  update: {
    name: 'Update note',
    sections: [
      { id: 'event', label: 'What happened', placeholder: 'Brief description of the event prompting the note.', minWords: 40 },
      { id: 'analysis', label: 'Analysis', placeholder: 'Implications for the thesis.', minWords: 80 },
      { id: 'estimates', label: 'Estimate changes', placeholder: 'Revised numbers if any.', minWords: 40 },
      { id: 'view', label: 'Our view', placeholder: 'What we think and why.', minWords: 60 },
    ]
  },
};

window.ReportBuilder = function ReportBuilder({ tone, cefr }) {
  const [templateId, setTemplateId] = useState_RB('initiation');
  const [draft, setDraft] = useState_RB({});
  const [reviews, setReviews] = useState_RB({});
  const [loading, setLoading] = useState_RB({});
  const [docId, setDocId] = useState_RB(null);
  const [reportTitle, setReportTitle] = useState_RB('My Initiation Report');

  const template = TEMPLATES[templateId];

  useEffect_RB(() => { loadLast(); }, []);

  async function loadLast() {
    const last = await window.Storage.getSetting('lastReportId');
    if (last) {
      const r = await window.Storage.get('documents', last);
      if (r && r.kind === 'report') {
        setDocId(r.id);
        setReportTitle(r.title);
        setDraft(r.sections || {});
        setTemplateId(r.templateId || 'initiation');
      }
    }
  }

  async function save() {
    const payload = {
      kind: 'report',
      templateId,
      title: reportTitle,
      sections: draft,
      tone, cefr,
      updatedAt: new Date().toISOString(),
    };
    if (docId) {
      await window.Storage.put('documents', { id: docId, ...payload });
    } else {
      const id = await window.Storage.add('documents', { ...payload, createdAt: new Date().toISOString() });
      setDocId(id);
      await window.Storage.setSetting('lastReportId', id);
    }
  }

  async function reviewSection(secId) {
    const text = (draft[secId] || '').trim();
    if (text.length < 30) {
      alert('Write at least 30 characters before requesting review.');
      return;
    }
    setLoading((s) => ({ ...s, [secId]: true }));
    try {
      const result = await window.Gemini.analyzeWriting({ text, tone, cefr });
      setReviews((r) => ({ ...r, [secId]: result }));
    } catch (e) {
      alert('Review failed: ' + e.message);
    } finally {
      setLoading((s) => ({ ...s, [secId]: false }));
    }
  }

  function exportMarkdown() {
    const lines = [`# ${reportTitle}`, ''];
    for (const sec of template.sections) {
      lines.push(`## ${sec.label}`, '', draft[sec.id] || '_(empty)_', '');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-2xl font-bold">Report Builder</h2>
        <div className="flex gap-2 flex-wrap">
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="px-2 py-1.5 text-sm rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800"
          >
            {Object.entries(TEMPLATES).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
          <button onClick={save} className="text-sm px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover">💾 Save</button>
          <button onClick={exportMarkdown} className="text-sm px-3 py-1.5 rounded bg-ink-100 dark:bg-ink-800 hover:bg-ink-200">⬇️ Export .md</button>
        </div>
      </div>

      <input
        value={reportTitle}
        onChange={(e) => setReportTitle(e.target.value)}
        className="w-full px-3 py-2 text-lg font-semibold rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800"
      />

      {template.sections.map((sec) => {
        const text = draft[sec.id] || '';
        const wc = text.split(/\s+/).filter(Boolean).length;
        const review = reviews[sec.id];
        return (
          <div key={sec.id} className="p-4 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{sec.label}</h3>
              <span className={`text-xs ${wc < sec.minWords ? 'text-red-500' : 'text-emerald-600'}`}>
                {wc} / ~{sec.minWords} words
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setDraft({ ...draft, [sec.id]: e.target.value })}
              placeholder={sec.placeholder}
              className="w-full p-3 rounded border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-sm leading-relaxed"
              rows={5}
            />
            <div className="flex gap-2">
              <button
                onClick={() => reviewSection(sec.id)}
                disabled={loading[sec.id]}
                className="text-xs px-3 py-1 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {loading[sec.id] ? 'Reviewing…' : '🔍 Review section'}
              </button>
            </div>
            {review && (
              <div className="mt-2 p-3 rounded bg-ink-50 dark:bg-ink-900 text-xs space-y-2">
                <div>
                  <span className="font-semibold">Score:</span> {review.overall_score}/100 ·
                  <span className="ml-2 font-semibold">Tone match:</span> {review.tone_match_score}/100
                </div>
                <div className="italic">{review.summary}</div>
                {review.issues && review.issues.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Issues ({review.issues.length})</summary>
                    <ul className="mt-1 space-y-1">
                      {review.issues.slice(0, 5).map((iss, i) => (
                        <li key={i}>
                          <span className="line-through opacity-60">{iss.original}</span> →{' '}
                          <span className="font-semibold">{iss.suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
