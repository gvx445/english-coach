/**
 * gemini.js — Google Gemini API client (browser-side).
 * KEPT ONLY for embeddings (DeepSeek does not provide an embedding API).
 * All text generation has been migrated to deepseek.js.
 *
 * Docs: https://ai.google.dev/api/generate-content
 */
(function () {
  const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

  function key() {
    const k = window.APP_CONFIG && window.APP_CONFIG.GEMINI_API_KEY;
    if (!k || k.startsWith('PASTE_')) {
      throw new Error('Gemini API key not configured for embeddings. Open Settings and paste your key.');
    }
    return k;
  }

  function friendlyError(status, body) {
    if (status === 401 || status === 403) return 'Gemini rejected the API key (' + status + ').';
    if (status === 429) return 'Gemini rate limit hit (429).';
    return 'Gemini API error ' + status + '. ' + (body ? body.slice(0, 200) : '');
  }

  async function embed(texts) {
    if (!Array.isArray(texts)) texts = [texts];
    const embedModel = (window.APP_CONFIG && window.APP_CONFIG.GEMINI_MODEL_EMBED) || 'text-embedding-004';
    const out = [];
    for (const t of texts) {
      const url = `${BASE}/${embedModel}:embedContent?key=${encodeURIComponent(key())}`;
      const body = {
        model: `models/${embedModel}`,
        content: { parts: [{ text: t }] },
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(friendlyError(res.status, errText));
      }
      const data = await res.json();
      out.push((data.embedding && data.embedding.values) || []);
    }
    return out;
  }

  function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
  }

  window.Gemini = { embed, cosine };
})();
