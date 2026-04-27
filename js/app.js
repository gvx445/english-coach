/**
 * app.js — Main app: sidebar nav + routing + global state.
 */
const { useState: useState_App, useEffect: useEffect_App, useCallback: useCallback_App } = React;

const NAV = [
  { id: 'editor',     label: 'Editor',     icon: '✍️' },
  { id: 'vocab',      label: 'Vocabulary', icon: '📚' },
  { id: 'mirror',     label: 'Mirror',     icon: '🪞' },
  { id: 'earnings',   label: 'Earnings',   icon: '📞' },
  { id: 'report',     label: 'Reports',    icon: '📑' },
  { id: 'challenge',  label: 'Challenge',  icon: '🎯' },
  { id: 'dashboard',  label: 'Dashboard',  icon: '📊' },
  { id: 'import',     label: 'Import',     icon: '📥' },
  { id: 'settings',   label: 'Settings',   icon: '⚙️' },
];

function App() {
  const initialKey = window.APP_CONFIG && window.APP_CONFIG.DEEPSEEK_API_KEY;
  const initialNeedsKey = !initialKey || initialKey.startsWith('PASTE_');
  const [route, setRoute] = useState_App(initialNeedsKey ? 'settings' : 'editor');
  const [tone, setTone] = useState_App('equity_analyst');
  const [cefr, setCefr] = useState_App((window.APP_CONFIG && window.APP_CONFIG.DEFAULT_CEFR) || 'B2');
  const [dark, setDark] = useState_App(true);
  const [analysis, setAnalysis] = useState_App(null);
  const [editorText, setEditorText] = useState_App('');
  const [showOnboarding, setShowOnboarding] = useState_App(false);
  const [sidebarOpen, setSidebarOpen] = useState_App(false);

  useEffect_App(() => {
    (async () => {
      const savedTone = await window.Storage.getSetting('tone');
      const savedCefr = await window.Storage.getSetting('cefr');
      const savedDark = await window.Storage.getSetting('dark');
      const savedAnon = await window.Storage.getSetting('anonymize');
      const onboardingDone = await window.Storage.getSetting('onboardingDone');
      if (savedTone) setTone(savedTone);
      if (savedCefr) setCefr(savedCefr);
      if (savedDark != null) setDark(savedDark);
      if (savedAnon != null && window.APP_CONFIG) window.APP_CONFIG.ANONYMIZE_BEFORE_API = savedAnon;
      if (!onboardingDone) {
        const k = window.APP_CONFIG && window.APP_CONFIG.DEEPSEEK_API_KEY;
        if (k && !k.startsWith('PASTE_')) setShowOnboarding(true);
      }
    })();
  }, []);

  useEffect_App(() => {
    document.documentElement.classList.toggle('dark', dark);
    window.Storage.setSetting('dark', dark);
  }, [dark]);

  useEffect_App(() => { window.Storage.setSetting('tone', tone); }, [tone]);
  useEffect_App(() => { window.Storage.setSetting('cefr', cefr); }, [cefr]);

  const onApplyFix = useCallback_App((iss) => {
    if (!iss || !iss.original || !iss.suggestion) return;
    window.dispatchEvent(new CustomEvent('apply-fix', { detail: iss }));
  }, []);

  function finishOnboarding(level) {
    setCefr(level);
    window.Storage.setSetting('onboardingDone', true);
    setShowOnboarding(false);
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <window.Onboarding onDone={finishOnboarding} />
      </div>
    );
  }

  // Show key-not-configured banner if needed
  const key = window.APP_CONFIG && window.APP_CONFIG.DEEPSEEK_API_KEY;
  const needsKey = !key || key.startsWith('PASTE_');

  return (
    <div className="min-h-screen flex">
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-56 bg-white dark:bg-ink-800 border-r border-ink-200 dark:border-ink-700 flex flex-col transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-ink-200 dark:border-ink-700">
          <div className="text-sm font-bold tracking-wide">English Coach</div>
          <div className="text-xs text-ink-500">Equity Analyst Edition</div>
        </div>
        <nav className="p-2 space-y-1 flex-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => { setRoute(n.id); setSidebarOpen(false); }}
              className={`nav-item w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${
                route === n.id
                  ? 'active'
                  : 'text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700'
              }`}
            >
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-ink-200 dark:border-ink-700">
          <div className="flex items-center justify-between text-xs gap-1">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="text-xs px-1 py-0.5 rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 flex-1 min-w-0"
              title="Tone"
            >
              <option value="equity_analyst">Equity</option>
              <option value="investment_banking">IB</option>
              <option value="academic">Academic</option>
              <option value="business_email">Email</option>
              <option value="casual">Casual</option>
            </select>
            <select
              value={cefr}
              onChange={(e) => setCefr(e.target.value)}
              className="text-xs px-1 py-0.5 rounded border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800"
              title="CEFR"
            >
              {['B1', 'B2', 'C1', 'C2'].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <button onClick={() => setDark(!dark)} className="text-base px-1">
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </aside>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-3 right-3 z-40 p-2 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <main className="flex-1 min-h-screen">
        {needsKey && (
          <div className="m-4 p-4 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-sm">
            ⚠️ DeepSeek API key not set on this device. Get one at{' '}
            <a className="underline font-semibold" href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer">platform.deepseek.com/api_keys</a>{' '}
            and paste it in Settings → DeepSeek API key.
          </div>
        )}
        {route === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 lg:h-screen">
            <div className="lg:col-span-2 flex flex-col min-h-0">
              <window.Editor
                tone={tone} cefr={cefr}
                onText={setEditorText}
                onAnalysis={setAnalysis}
              />
            </div>
            <div className="lg:col-span-1 lg:h-auto min-h-0">
              <window.InsightPanel
                analysis={analysis} text={editorText}
                tone={tone} cefr={cefr}
                onApplyFix={onApplyFix}
              />
            </div>
          </div>
        )}
        {route === 'vocab' && <window.Vocabulary />}
        {route === 'mirror' && <window.MirrorWriting cefr={cefr} />}
        {route === 'earnings' && <window.EarningsDrill cefr={cefr} />}
        {route === 'report' && <window.ReportBuilder tone={tone} cefr={cefr} />}
        {route === 'challenge' && <window.WeeklyChallenge cefr={cefr} />}
        {route === 'dashboard' && <window.Dashboard />}
        {route === 'import' && <window.ImportData />}
        {route === 'settings' && (
          <window.Settings
            tone={tone} setTone={setTone}
            cefr={cefr} setCefr={setCefr}
            dark={dark} setDark={setDark}
          />
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
