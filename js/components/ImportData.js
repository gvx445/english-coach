/**
 * ImportData.js — upload PDFs (corpus) and Excel files (vocabulary).
 */
const { useState: useState_ID, useRef: useRef_ID, useEffect: useEffect_ID } = React;

window.ImportData = function ImportData() {
  const [pdfStatus, setPdfStatus] = useState_ID('');
  const [xlsStatus, setXlsStatus] = useState_ID('');
  const [corpusList, setCorpusList] = useState_ID([]);
  const [pdfLoaded, setPdfLoaded] = useState_ID(false);
  const [xlsLoaded, setXlsLoaded] = useState_ID(false);
  const pdfRef = useRef_ID(null);
  const xlsRef = useRef_ID(null);

  useEffect_ID(() => { loadCorpus(); loadLibs(); }, []);

  function loadLibs() {
    if (!window.pdfjsLib) {
      const fallback = document.createElement('script');
      fallback.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      fallback.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          setPdfLoaded(true);
        }
      };
      document.head.appendChild(fallback);
    } else { setPdfLoaded(true); }

    if (!window.XLSX) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload = () => setXlsLoaded(true);
      document.head.appendChild(s);
    } else { setXlsLoaded(true); }
  }

  async function loadCorpus() {
    const all = await window.Storage.getAll('corpus');
    const grouped = {};
    all.forEach((c) => {
      const k = c.source || 'unknown';
      if (!grouped[k]) grouped[k] = { source: k, title: c.title, count: 0 };
      grouped[k].count++;
    });
    setCorpusList(Object.values(grouped));
  }

  async function importPDFs(files) {
    if (!window.pdfjsLib) {
      setPdfStatus('PDF.js still loading, try again in a second…');
      return;
    }
    setPdfStatus(`Processing ${files.length} file(s)…`);
    for (const file of files) {
      try {
        setPdfStatus(`Reading ${file.name}…`);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((it) => it.str).join(' ');
          text += pageText + '\n\n';
        }
        setPdfStatus(`Embedding chunks from ${file.name}…`);
        await window.RAG.ingestDocument({
          source: file.name,
          title: file.name.replace(/\.[^.]+$/, ''),
          text,
          kind: 'report',
        });
      } catch (e) {
        console.error(e);
        setPdfStatus(`Failed on ${file.name}: ${e.message}`);
      }
    }
    setPdfStatus(`Done. Imported ${files.length} file(s).`);
    loadCorpus();
  }

  async function importExcels(files) {
    if (!window.XLSX) {
      setXlsStatus('SheetJS still loading, try again in a second…');
      return;
    }
    setXlsStatus(`Processing ${files.length} file(s)…`);
    let totalImported = 0;
    const existing = await window.Storage.getAll('vocabulary');
    const existingTerms = new Set(existing.map((v) => v.term.toLowerCase()));

    for (const file of files) {
      try {
        setXlsStatus(`Reading ${file.name}…`);
        const buf = await file.arrayBuffer();
        const wb = window.XLSX.read(buf, { type: 'array' });
        for (const sheetName of wb.SheetNames) {
          const sheet = wb.Sheets[sheetName];
          const rows = window.XLSX.utils.sheet_to_json(sheet, { defval: '' });
          for (const row of rows) {
            const keys = Object.keys(row);
            if (keys.length === 0) continue;
            const values = keys.map((k) => String(row[k]).trim()).filter(Boolean);
            if (values.length === 0) continue;

            const term = values[0];
            if (!term || term.length > 200 || existingTerms.has(term.toLowerCase())) continue;

            const italianOrDef = values[1] || '';
            const example = values[2] || '';

            const itHints = /\b(il |la |lo |gli |le |di |e |o |un |una |che |non |per |con )\b/i;
            const looksItalian = itHints.test(italianOrDef);

            const id = await window.Storage.add('vocabulary', {
              term,
              type: detectType(term),
              cefr: 'B2',
              definition: looksItalian ? '' : italianOrDef,
              italian: looksItalian ? italianOrDef : '',
              example,
              category: file.name.replace(/\.[^.]+$/, ''),
              createdAt: new Date().toISOString(),
            });
            await window.SRS.ensureCardForVocab(id);
            existingTerms.add(term.toLowerCase());
            totalImported++;
          }
        }
      } catch (e) {
        console.error(e);
        setXlsStatus(`Failed on ${file.name}: ${e.message}`);
      }
    }
    setXlsStatus(`Done. Imported ${totalImported} new term(s) into your vocabulary.`);
  }

  function detectType(term) {
    const t = term.toLowerCase();
    if (t.split(/\s+/).length === 1) return 'word';
    if (/^(get|put|take|make|come|go|run|set|turn|hold|look)\b/.test(t)) return 'phrasal_verb';
    if (t.split(/\s+/).length >= 4) return 'idiom';
    return 'collocation';
  }

  async function clearCorpus() {
    if (!confirm('Delete all imported corpus chunks? (vocabulary is kept)')) return;
    await window.Storage.clear('corpus');
    loadCorpus();
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">Import data</h2>

      <div className="p-4 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded space-y-3">
        <h3 className="font-semibold">📄 PDF reports → corpus (for Mirror Writing & RAG)</h3>
        <p className="text-sm text-ink-500">
          Upload research reports (e.g. JPM, Barclays, UBS, Deutsche Bank notes from your "intesa" Drive folder).
          They are chunked, embedded with Gemini, and used as gold standards for Mirror Writing.
        </p>
        <input ref={pdfRef} type="file" accept=".pdf" multiple
          onChange={(e) => importPDFs(Array.from(e.target.files || []))}
          disabled={!pdfLoaded} className="text-sm" />
        {!pdfLoaded && <div className="text-xs text-ink-500">Loading PDF.js…</div>}
        {pdfStatus && <div className="text-sm font-mono text-accent">{pdfStatus}</div>}
      </div>

      <div className="p-4 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded space-y-3">
        <h3 className="font-semibold">📊 Excel files → vocabulary</h3>
        <p className="text-sm text-ink-500">
          Upload .xlsx / .xls / .csv files (your "inglese" Drive folder — parole, idioms, etc.).
          First column → term. Second → Italian translation or definition. Third → example.
        </p>
        <input ref={xlsRef} type="file" accept=".xlsx,.xls,.csv" multiple
          onChange={(e) => importExcels(Array.from(e.target.files || []))}
          disabled={!xlsLoaded} className="text-sm" />
        {!xlsLoaded && <div className="text-xs text-ink-500">Loading SheetJS…</div>}
        {xlsStatus && <div className="text-sm font-mono text-accent">{xlsStatus}</div>}
      </div>

      <div className="p-4 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Imported corpus</h3>
          {corpusList.length > 0 && (
            <button onClick={clearCorpus} className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200">
              Clear all
            </button>
          )}
        </div>
        {corpusList.length === 0 ? (
          <div className="text-sm text-ink-500 italic">Nothing imported yet.</div>
        ) : (
          <ul className="space-y-1 text-sm">
            {corpusList.map((c) => (
              <li key={c.source} className="flex justify-between">
                <span>{c.title || c.source}</span>
                <span className="text-xs text-ink-400">{c.count} chunks</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
