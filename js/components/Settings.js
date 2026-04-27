/**
 * Settings.js — user preferences, API key management, backup, danger zone.
 */
const { useState: useState_S, useEffect: useEffect_S } = React;

window.Settings = function Settings({ tone, setTone, cefr, setCefr, dark, setDark }) {
  const [anonymize, setAnonymize] = useState_S(true);
  const [apiKey, setApiKey] = useState_S('');
  const [apiKeyDraft, setApiKeyDraft] = useState_S('');
  const [showKey, setShowKey] = useState_S(false);
  const [keyTesting, setKeyTesting] = useState_S(false);
  const [keyTestResult, setKeyTestResult] = useState_S(null);

  useEffect_S(() => {
    setAnonymize(window.APP_CONFIG.ANONYMIZE_BEFORE_API !== false);
    const k = window.APP_CONFIG.GEMINI_API_KEY || '';
    setApiKey(k);
    setApiKeyDraft(k);
  }, []);

  function toggleAnonymize() {
    const v = !anonymize;
    setAnonymize(v);
    window.APP_CONFIG.ANONYMIZE_BEFORE_API = v;
    window.Storage.setSetting('anonymize', v);
  }

  function saveKey() {
    const k = (apiKeyDraft || '').trim();
    const lsKey = window.APP_CONFIG.GEMINI_API_KEY_LS_KEY || 'englishCoach.geminiApiKey';
    if (!k) {
      // Clear
      if (!confirm('Remove the saved API key from this device?')) return;
      try { localStorage.removeItem(lsKey); } catch (_) {}
      window.APP_CONFIG.GEMINI_API_KEY = '';
      setApiKey('');
      setKeyTestResult(null);
      return;
    }
    if (!k.startsWith('AIza')) {
      if (!confirm("That doesn't look like a Gemini API key (Gemini keys start with 'AIza'). Save anyway?")) return;
    }
    try { localStorage.setItem(lsKey, k); }
    catch (e) { alert('Could not save key to localStorage: ' + e.message); return; }
    window.APP_CONFIG.GEMINI_API_KEY = k;
    setApiKey(k);
    setKeyTestResult(null);
  }

  async function testKey() {
    setKeyTesting(true);
    setKeyTestResult(null);
    try {
      // Cheapest possible call: 5-token completion on Flash-Lite
      const out = await window.Gemini.generate({
        model: window.APP_CONFIG.GEMINI_MODEL_FAST,
        prompt: 'Reply with exactly the word: ok',
        temperature: 0,
        maxTokens: 8,
      });
      setKeyTestResult({ ok: true, msg: 'Key works. Gemini replied: "' + (out || '').trim().slice(0, 30) + '"' });
    } catch (e) {
      setKeyTestResult({ ok: false, msg: e.message });
    } finally {
      setKeyTesting(false);
    }
  }

  async function exportBackup() {
    const data = await window.Storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `english-coach-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importBackup(file) {
    if (!confirm('This will REPLACE your current data with the contents of the backup. Continue?')) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await window.Storage.importAll(data);
      alert('Backup restored. Reloading…');
      location.reload();
    } catch (e) {
      alert('Restore failed: ' + e.message);
    }
  }

  async function wipeAll() {
    if (!confirm('Permanently DELETE all local data (documents, vocabulary, errors, corpus)? This cannot be undone.')) return;
    for (const s of ['documents', 'errors', 'vocabulary', 'srs', 'corpus', 'sessions']) {
      await window.Storage.clear(s);
    }
    alert('Wiped. Reloading…');
    location.reload();
  }

  const hasKey = apiKey && !apiKey.startsWith('PASTE_');
  const keyStatus = hasKey
    ? `✓ Key set on this device (${apiKey.slice(0, 6)}…${apiKey.slice(-4)})`
    : '❌ No key set on this device';
  const draftChanged = (apiKeyDraft || '') !== (apiKey || '');

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <Section title="Profile">
        <Row label="Default tone">
          <select value={tone} onChange={(e) => setTone(e.target.value)} className="px-2 py-1 rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800">
            <option value="equity_analyst">Equity Analyst</option>
            <option value="investment_banking">Investment Banking</option>
            <option value="academic">Academic</option>
            <option value="business_email">Business Email</option>
            <option value="casual">Casual</option>
            <option value="informal">Informal</option>
          </select>
        </Row>
        <Row label="CEFR level">
          <select value={cefr} onChange={(e) => setCefr(e.target.value)} className="px-2 py-1 rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800">
            {['B1', 'B2', 'C1', 'C2'].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </Row>
        <Row label="Dark mode">
          <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
        </Row>
      </Section>

      <Section title="Gemini API key">
        <div className="text-xs">{keyStatus}</div>
        <div className="flex gap-2">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKeyDraft}
            onChange={(e) => setApiKeyDraft(e.target.value)}
            placeholder="AIza…"
            className="flex-1 px-2 py-1.5 text-sm font-mono rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800"
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="text-xs px-2 py-1 rounded bg-ink-100 dark:bg-ink-800 hover:bg-ink-200"
            title={showKey ? 'Hide' : 'Show'}
          >
            {showKey ? '🙈' : '👁'}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={saveKey}
            disabled={!draftChanged}
            className="text-sm px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50"
          >
            💾 Save key on this device
          </button>
          <button
            onClick={testKey}
            disabled={keyTesting || !hasKey}
            className="text-sm px-3 py-1.5 rounded bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 disabled:opacity-50"
          >
            {keyTesting ? 'Testing…' : '🧪 Test key'}
          </button>
        </div>
        {keyTestResult && (
          <div className={`text-xs p-2 rounded ${keyTestResult.ok ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200' : 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200'}`}>
            {keyTestResult.msg}
          </div>
        )}
        <p className="text-xs text-ink-500">
          Get a key at <a className="underline text-accent" href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">aistudio.google.com/apikey</a>.
          The key is stored in this browser's localStorage — it never leaves your device, except when calling Gemini directly.
          Each device (laptop, phone) needs its own key set once.
        </p>
      </Section>

      <Section title="Privacy">
        <Row label="Anonymize before API">
          <input type="checkbox" checked={anonymize} onChange={toggleAnonymize} />
        </Row>
        <p className="text-xs text-ink-500">
          When enabled, ticker symbols and large currency amounts are replaced with placeholders (e.g. <code>__TICKER_1__</code>) before
          being sent to Gemini, then restored in the response. Note: on the free Gemini tier, Google may use prompts to improve their models.
          Do not paste confidential employer data while on the free tier.
        </p>
      </Section>

      <Section title="Backup">
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportBackup} className="text-sm px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover">
            ⬇️ Export all data (JSON)
          </button>
          <label className="text-sm px-3 py-1.5 rounded bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 cursor-pointer">
            ⬆️ Import backup
            <input type="file" accept=".json" className="hidden" onChange={(e) => e.target.files && e.target.files[0] && importBackup(e.target.files[0])} />
          </label>
        </div>
        <p className="text-xs text-ink-500">
          All learning data (documents, vocabulary, errors, corpus) is stored in this browser's IndexedDB.
          Export regularly so you don't lose progress if you clear browser data, switch device, or reinstall.
          The exported JSON does NOT contain your API key.
        </p>
      </Section>

      <Section title="Danger zone">
        <button onClick={wipeAll} className="text-sm px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700">
          🗑 Wipe all local data
        </button>
      </Section>
    </div>
  );
};

function Section({ title, children }) {
  return (
    <div className="p-4 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded space-y-3">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  );
}
function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  );
}
