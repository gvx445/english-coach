/**
 * gemini.js — Google Gemini API client (browser-side).
 * Docs: https://ai.google.dev/api/generate-content
 *
 * Robustness features:
 *   - Auto-retry on 503 (server overloaded) with exponential backoff
 *   - Auto-retry on 429 (rate limit) with delay parsed from error
 *   - Auto-fallback DEEP→FAST when DEEP model is quota-exhausted
 *   - Permissive JSON extraction (tolerates preamble/postamble around the JSON)
 *   - Friendly error messages distinguishing 401/403/429/503/etc.
 */
(function () {
  const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

  // -------- helpers --------

  function key() {
    const k = window.APP_CONFIG && window.APP_CONFIG.GEMINI_API_KEY;
    if (!k || k.startsWith('PASTE_')) {
      throw new Error('Gemini API key not configured. Open Settings and paste your key from https://aistudio.google.com/apikey');
    }
    return k;
  }

  function fastModel() {
    return (window.APP_CONFIG && window.APP_CONFIG.GEMINI_MODEL_FAST) || 'gemini-2.5-flash-lite';
  }
  function deepModel() {
    return (window.APP_CONFIG && window.APP_CONFIG.GEMINI_MODEL_DEEP) || 'gemini-2.5-flash';
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /**
   * Permissive JSON parser. Gemini sometimes wraps JSON in ```json fences,
   * sometimes adds a preamble like "Here is the result:". This extracts
   * the substring from the first '{' to the last '}'.
   */
  function parseLooseJSON(text) {
    if (!text) throw new Error('Empty response from Gemini');
    // Try fast path first: clean fences
    const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    try { return JSON.parse(cleaned); } catch (_) {}
    // Fallback: substring between first { and last }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      console.error('No JSON braces found in response:', text);
      throw new Error('Gemini returned no JSON. Try again.');
    }
    const slice = text.substring(start, end + 1);
    try { return JSON.parse(slice); }
    catch (e) {
      console.error('JSON parse failed. Raw text:', text);
      throw new Error('Failed to parse JSON from Gemini.');
    }
  }

  /**
   * Friendly translation of HTTP status → user message.
   */
  function friendlyError(status, body) {
    if (status === 400) return 'Bad request to Gemini (400). The prompt may be malformed or too long.';
    if (status === 401 || status === 403) {
      return 'Gemini rejected the API key (' + status + '). Open config.local.js, check the key is correct, ' +
             'and verify it works in https://aistudio.google.com playground.';
    }
    if (status === 429) {
      // Try to extract retry-after from Google's error body
      let retrySec = null;
      const m = body && body.match(/retry in ([\d.]+)s/i);
      if (m) retrySec = Math.ceil(parseFloat(m[1]));
      return 'Gemini rate limit hit (429). ' +
             (retrySec ? `Wait ${retrySec}s and retry. ` : 'Wait ~60s. ') +
             'Free tier: Flash-Lite = 15 req/min and 1000/day, Flash = 10 req/min and 250/day.';
    }
    if (status === 500) return 'Gemini internal error (500). Usually transient — try again.';
    if (status === 503) return 'Gemini servers are overloaded (503). Try again in a few seconds.';
    return 'Gemini API error ' + status + '. ' + (body ? body.slice(0, 200) : '');
  }

  // -------- low-level call with retry --------

  /**
   * Single fetch attempt. Returns { text } or throws an error with .status set.
   */
  async function callRaw({ model, prompt, systemInstruction, jsonMode, temperature, maxTokens }) {
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    };
    if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };
    if (jsonMode) body.generationConfig.responseMimeType = 'application/json';

    const url = `${BASE}/${model}:generateContent?key=${encodeURIComponent(key())}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      const err = new Error(friendlyError(res.status, errText));
      err.status = res.status;
      err.body = errText;
      throw err;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    return { text };
  }

  /**
   * callOnce with automatic retry on 503 (server overloaded) and 429
   * with backoff: 1.5s, 4s, 9s.
   */
  async function callWithRetry(args) {
    const delays = [1500, 4000, 9000];
    let lastErr;
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        return await callRaw(args);
      } catch (e) {
        lastErr = e;
        const isRetryable = e.status === 503 || e.status === 500 || e.status === 429;
        if (!isRetryable || attempt === delays.length) throw e;
        // Don't retry-spam 429: respect Google's retry-after if present
        let waitMs = delays[attempt];
        const m = e.body && e.body.match(/retry in ([\d.]+)s/i);
        if (m && e.status === 429) {
          waitMs = Math.min(Math.ceil(parseFloat(m[1])) * 1000, 30000);
        }
        console.warn(`[Gemini] ${e.status} on ${args.model}, retry ${attempt + 1}/${delays.length} in ${waitMs}ms`);
        await sleep(waitMs);
      }
    }
    throw lastErr;
  }

  /**
   * High-level generate. Auto-falls-back DEEP→FAST when the requested
   * model is quota-exhausted (limit:0 or persistent 429).
   */
  async function generate({ model, prompt, systemInstruction, jsonMode = false, temperature = 0.4, maxTokens = 2048 }) {
    const requested = model || fastModel();
    let result;
    try {
      result = await callWithRetry({ model: requested, prompt, systemInstruction, jsonMode, temperature, maxTokens });
    } catch (e) {
      const isQuota = e.status === 429 || (e.body && /RESOURCE_EXHAUSTED|limit: 0/i.test(e.body));
      if (isQuota && requested !== fastModel()) {
        console.warn(`[Gemini] ${requested} exhausted; falling back to ${fastModel()}`);
        result = await callWithRetry({ model: fastModel(), prompt, systemInstruction, jsonMode, temperature, maxTokens });
      } else {
        throw e;
      }
    }
    if (jsonMode) return parseLooseJSON(result.text);
    return result.text;
  }

  // -------- embeddings --------

  async function embed(texts) {
    if (!Array.isArray(texts)) texts = [texts];
    const embedModel = (window.APP_CONFIG && window.APP_CONFIG.GEMINI_MODEL_EMBED) || 'text-embedding-004';
    const url = `${BASE}/${embedModel}:batchEmbedContents?key=${encodeURIComponent(key())}`;
    const body = {
      requests: texts.map((t) => ({
        model: `models/${embedModel}`,
        content: { parts: [{ text: t }] },
      })),
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
    return (data.embeddings || []).map((e) => e.values);
  }

  function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
  }

  // -------- high-level wrappers --------

  async function analyzeWriting({ text, tone = 'equity_analyst', cefr = 'C1' }) {
    const { anonymize, deanonymize } = window.Anonymizer;
    const { text: cleanText, map } = anonymize(text);
    const sys = window.PROMPTS.ANALYZE_SYSTEM(tone, cefr);
    const user = window.PROMPTS.ANALYZE_USER(cleanText);
    const result = await generate({
      model: fastModel(),
      prompt: user, systemInstruction: sys,
      jsonMode: true, temperature: 0.2, maxTokens: 4096,
    });
    if (result && Array.isArray(result.issues)) {
      result.issues.forEach((iss) => {
        if (iss.original) iss.original = deanonymize(iss.original, map);
        if (iss.suggestion) iss.suggestion = deanonymize(iss.suggestion, map);
        if (iss.explanation) iss.explanation = deanonymize(iss.explanation, map);
      });
    }
    return result;
  }

  async function rewriteText({ text, tone = 'equity_analyst', mode = 'polish' }) {
    const { anonymize, deanonymize } = window.Anonymizer;
    const { text: cleanText, map } = anonymize(text);
    const sys = window.PROMPTS.REWRITE_SYSTEM(tone, mode);
    const user = window.PROMPTS.REWRITE_USER(cleanText);
    const result = await generate({
      model: deepModel(),
      prompt: user, systemInstruction: sys,
      jsonMode: true, temperature: 0.6, maxTokens: 4096,
    });
    if (result && Array.isArray(result.alternatives)) {
      result.alternatives = result.alternatives.map((a) => deanonymize(a, map));
    }
    return result;
  }

  async function explainIssue({ original, correction, category, cefr = 'C1' }) {
    const sys = window.PROMPTS.EXPLAIN_SYSTEM(cefr);
    const user = window.PROMPTS.EXPLAIN_USER({ original, correction, category });
    return generate({
      model: fastModel(),
      prompt: user, systemInstruction: sys,
      jsonMode: true, temperature: 0.3, maxTokens: 1024,
    });
  }

  async function detectItalianInterference({ text, cefr = 'C1' }) {
    const { anonymize, deanonymize } = window.Anonymizer;
    const { text: cleanText, map } = anonymize(text);
    const sys = window.PROMPTS.ITALIAN_INTERFERENCE_SYSTEM(cefr);
    const user = window.PROMPTS.ITALIAN_INTERFERENCE_USER(cleanText);
    const result = await generate({
      model: fastModel(),
      prompt: user, systemInstruction: sys,
      jsonMode: true, temperature: 0.2,
    });
    if (result && Array.isArray(result.issues)) {
      result.issues.forEach((iss) => {
        if (iss.original) iss.original = deanonymize(iss.original, map);
        if (iss.suggestion) iss.suggestion = deanonymize(iss.suggestion, map);
      });
    }
    return result;
  }

  async function mirrorCompare({ userText, originalText, cefr = 'C1' }) {
    const sys = window.PROMPTS.MIRROR_SYSTEM(cefr);
    const user = window.PROMPTS.MIRROR_USER({ userText, originalText });
    return generate({
      model: deepModel(),
      prompt: user, systemInstruction: sys,
      jsonMode: true, temperature: 0.3, maxTokens: 2048,
    });
  }

  async function earningsScore({ summary, transcript, cefr = 'C1' }) {
    const sys = window.PROMPTS.EARNINGS_SYSTEM(cefr);
    const user = window.PROMPTS.EARNINGS_USER({ summary, transcript });
    return generate({
      model: deepModel(),
      prompt: user, systemInstruction: sys,
      jsonMode: true, temperature: 0.3, maxTokens: 2048,
    });
  }

  async function generateChallenge({ cefr = 'C1', topic = null, weakAreas = [] }) {
    const sys = window.PROMPTS.CHALLENGE_SYSTEM(cefr);
    const user = window.PROMPTS.CHALLENGE_USER({ topic, weakAreas });
    return generate({
      model: fastModel(),
      prompt: user, systemInstruction: sys,
      jsonMode: true, temperature: 0.9, maxTokens: 1024,
    });
  }

  async function placementTest({ samples }) {
    const sys = window.PROMPTS.PLACEMENT_SYSTEM();
    const user = window.PROMPTS.PLACEMENT_USER(samples);
    return generate({
      model: deepModel(),
      prompt: user, systemInstruction: sys,
      jsonMode: true, temperature: 0.2, maxTokens: 2048,
    });
  }

  window.Gemini = {
    generate, embed, cosine,
    analyzeWriting, rewriteText, explainIssue, detectItalianInterference,
    mirrorCompare, earningsScore, generateChallenge, placementTest,
  };
})();
