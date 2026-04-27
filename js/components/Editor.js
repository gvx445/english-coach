/**
 * Editor.js — Main writing editor with Quill + inline annotations.
 */
const { useState: useState_E, useEffect: useEffect_E, useRef: useRef_E, useCallback: useCallback_E } = React;

window.Editor = function Editor({ tone, cefr, onAnalysis, onText }) {
  const containerRef = useRef_E(null);
  const quillRef = useRef_E(null);
  const [text, setText] = useState_E('');
  const [isAnalyzing, setIsAnalyzing] = useState_E(false);
  const [error, setError] = useState_E(null);
  const debounceTimer = useRef_E(null);
  const saveTimer = useRef_E(null);
  const [docId, setDocId] = useState_E(null);
  const [docTitle, setDocTitle] = useState_E('Untitled');

  useEffect_E(() => {
    if (containerRef.current && !quillRef.current) {
      quillRef.current = new Quill(containerRef.current, {
        theme: 'snow',
        placeholder: 'Start writing in English. Drafts auto-save locally. Analysis runs ~1.5s after you stop typing.',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['blockquote'],
            ['clean'],
          ],
        },
      });
      quillRef.current.on('text-change', () => {
        const t = quillRef.current.getText().trim();
        setText(t);
        if (onText) onText(t);
        scheduleAutoSave(t);
        scheduleAnalysis(t);
      });

      (async () => {
        const lastId = await window.Storage.getSetting('lastDocId');
        if (lastId) {
          const doc = await window.Storage.get('documents', lastId);
          if (doc) {
            setDocId(doc.id);
            setDocTitle(doc.title || 'Untitled');
            quillRef.current.setText(doc.text || '');
          }
        }
      })();
    }

    // Listen for apply-fix events from the InsightPanel via app.js
    const handler = (e) => {
      const iss = e.detail;
      if (!iss || !quillRef.current) return;
      const fullText = quillRef.current.getText();
      const off = fullText.indexOf(iss.original);
      if (off < 0) return;
      quillRef.current.deleteText(off, iss.original.length, 'user');
      quillRef.current.insertText(off, iss.suggestion, 'user');
    };
    window.addEventListener('apply-fix', handler);
    return () => window.removeEventListener('apply-fix', handler);
  }, []);

  const scheduleAutoSave = useCallback_E((t) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(t), (window.APP_CONFIG && window.APP_CONFIG.AUTO_SAVE_DEBOUNCE) || 800);
  }, [docId, docTitle, tone, cefr]);

  const save = async (t) => {
    const payload = {
      title: docTitle, text: t, tone, cefr,
      updatedAt: new Date().toISOString(),
    };
    try {
      if (docId) {
        await window.Storage.put('documents', { id: docId, ...payload });
      } else {
        const id = await window.Storage.add('documents', { ...payload, createdAt: new Date().toISOString() });
        setDocId(id);
        await window.Storage.setSetting('lastDocId', id);
      }
    } catch (e) { console.warn('Save failed', e); }
  };

  const scheduleAnalysis = useCallback_E((t) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!t || t.length < 30) {
      if (onAnalysis) onAnalysis({ issues: [], llm: null });
      clearAnnotations();
      return;
    }
    debounceTimer.current = setTimeout(() => runAnalysis(t), (window.APP_CONFIG && window.APP_CONFIG.ANALYSIS_DEBOUNCE) || 1500);
  }, [tone, cefr]);

  const runAnalysis = async (t) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const allIssues = [];

      // 1) Local Italian-trap scan
      const localIssues = window.scanItalianTraps(t);
      allIssues.push(...localIssues);

      // 2) LanguageTool grammar
      try {
        const ltResult = await window.LanguageTool.check(t);
        const ltIssues = window.LanguageTool.toIssues(ltResult, t);
        allIssues.push(...ltIssues);
      } catch (e) { console.warn('LanguageTool failed', e); }

      // 3) LLM analysis
      let llm = null;
      try {
        llm = await window.Gemini.analyzeWriting({ text: t, tone, cefr });
        if (llm && Array.isArray(llm.issues)) {
          llm.issues.forEach((iss) => {
            const off = t.indexOf(iss.original);
            if (off >= 0) { iss.offset = off; iss.length = iss.original.length; }
            iss.source = 'gemini';
          });
          allIssues.push(...llm.issues);
        }
      } catch (e) {
        setError('Gemini: ' + e.message);
      }

      const uniq = dedupeIssues(allIssues);
      applyAnnotations(uniq);

      // Log errors for tracking
      for (const iss of uniq) {
        if (iss.category && iss.original) {
          await window.Storage.add('errors', {
            category: iss.category,
            severity: iss.severity || 'medium',
            original: iss.original,
            suggestion: iss.suggestion || '',
            rule: iss.rule || '',
            createdAt: new Date().toISOString(),
            docId,
          });
        }
      }

      if (onAnalysis) onAnalysis({ issues: uniq, llm });
    } catch (e) {
      setError(e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  function dedupeIssues(list) {
    const seen = new Set();
    return list.filter((i) => {
      const key = `${i.offset || 0}-${i.original}-${i.suggestion}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function clearAnnotations() {
    if (!quillRef.current) return;
    const len = quillRef.current.getLength();
    quillRef.current.formatText(0, len, { background: false }, 'silent');
  }

  function applyAnnotations(list) {
    if (!quillRef.current) return;
    clearAnnotations();
    const colorMap = {
      grammar: 'rgba(239,68,68,0.18)',
      style: 'rgba(59,130,246,0.18)',
      vocabulary: 'rgba(168,85,247,0.18)',
      tone: 'rgba(16,185,129,0.18)',
      italian_interference: 'rgba(245,158,11,0.22)',
    };
    list.forEach((iss) => {
      if (iss.offset == null || iss.length == null) return;
      const bg = colorMap[iss.category] || 'rgba(239,68,68,0.18)';
      try {
        quillRef.current.formatText(iss.offset, iss.length, { background: bg }, 'silent');
      } catch (e) {}
    });
  }

  const newDoc = async () => {
    setDocId(null); setDocTitle('Untitled');
    quillRef.current.setText('');
    await window.Storage.setSetting('lastDocId', null);
    if (onAnalysis) onAnalysis({ issues: [], llm: null });
  };

  const renameDoc = async () => {
    const t = prompt('Document title:', docTitle);
    if (t) {
      setDocTitle(t);
      if (docId) await window.Storage.put('documents', { id: docId, title: t, text, tone, cefr, updatedAt: new Date().toISOString() });
    }
  };

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <button onClick={renameDoc} className="text-sm font-semibold text-ink-800 dark:text-ink-100 hover:underline">
            {docTitle}
          </button>
          <span className="text-xs text-ink-400">{wordCount} words</span>
        </div>
        <div className="flex items-center gap-2">
          {isAnalyzing && (
            <span className="text-xs text-accent flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              analyzing…
            </span>
          )}
          <button onClick={newDoc} className="text-xs px-2 py-1 rounded bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700">
            + New
          </button>
        </div>
      </div>
      {error && (
        <div className="mb-3 p-3 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          ⚠ {error}
        </div>
      )}
      <div ref={containerRef} className="flex-1" style={{ minHeight: 400 }}></div>
    </div>
  );
};
