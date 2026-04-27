/**
 * Dashboard.js — KPIs and progress charts.
 */
const { useState: useState_D, useEffect: useEffect_D } = React;

window.Dashboard = function Dashboard() {
  const [stats, setStats] = useState_D(null);

  useEffect_D(() => { load(); }, []);

  async function load() {
    const docs = await window.Storage.getAll('documents');
    const errors = await window.Storage.getAll('errors');
    const vocab = await window.Storage.getAll('vocabulary');
    const srs = await window.Storage.getAll('srs');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const buckets = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }
    errors.forEach((e) => {
      const day = (e.createdAt || '').slice(0, 10);
      if (buckets[day] != null) buckets[day]++;
    });
    const errorsOverTime = Object.entries(buckets).map(([date, count]) => ({ date: date.slice(5), count }));

    const catCounts = {};
    errors.forEach((e) => { catCounts[e.category] = (catCounts[e.category] || 0) + 1; });
    const errorsByCategory = Object.entries(catCounts).map(([category, count]) => ({ category, count }));

    const cefrCounts = {};
    vocab.forEach((v) => { cefrCounts[v.cefr || 'unknown'] = (cefrCounts[v.cefr || 'unknown'] || 0) + 1; });
    const vocabByCEFR = Object.entries(cefrCounts).map(([cefr, count]) => ({ cefr, count }));

    const totalWords = docs.reduce((s, d) => s + ((d.text || '').split(/\s+/).filter(Boolean).length), 0);

    const now = new Date();
    const dueToday = srs.filter((c) => c.dueDate && new Date(c.dueDate) <= now).length;

    setStats({
      docs: docs.length, errors: errors.length, vocab: vocab.length,
      totalWords, dueToday,
      errorsOverTime, errorsByCategory, vocabByCEFR,
    });
  }

  if (!stats) return <div className="p-4">Loading…</div>;

  const Recharts = window.Recharts;
  if (!Recharts) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <KPIGrid stats={stats} />
        <p className="text-sm text-ink-500">Charts library not loaded.</p>
      </div>
    );
  }
  const { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } = Recharts;
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#a855f7', '#ef4444', '#3b82f6'];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <KPIGrid stats={stats} />

      <div className="p-4 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded">
        <h3 className="text-sm font-semibold mb-2">Errors over the last 14 days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={stats.errorsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded">
          <h3 className="text-sm font-semibold mb-2">Errors by category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.errorsByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded">
          <h3 className="text-sm font-semibold mb-2">Vocabulary by CEFR</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.vocabByCEFR} dataKey="count" nameKey="cefr" cx="50%" cy="50%" outerRadius={70} label>
                {stats.vocabByCEFR.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

function KPIGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <KPI label="Documents" value={stats.docs} />
      <KPI label="Words written" value={stats.totalWords} />
      <KPI label="Errors logged" value={stats.errors} />
      <KPI label="Vocabulary" value={stats.vocab} />
      <KPI label="Due today" value={stats.dueToday} />
    </div>
  );
}
function KPI({ label, value }) {
  return (
    <div className="p-3 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-center">
      <div className="text-2xl font-bold text-accent">{value}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  );
}
