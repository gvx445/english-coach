/**
 * deepseek.js — DeepSeek API client (browser-side).
 * OpenAI-compatible API: https://api.deepseek.com
 *
 * Models:
 *   deepseek-v4-flash  — fast, lightweight (default for quick tasks)
 *   deepseek-v4-pro    — deep reasoning (default for complex tasks)
 *
 * Robustness features:
 *   - Auto-retry on 503 (server overloaded) with exponential backoff
 *   - Auto-retry on 429 (rate limit) with delay parsed from error
 *   - Auto-fallback PRO→FLASH when PRO model is quota-exhausted
 *   - Permissive JSON extraction (tolerates preamble/postamble around the JSON)
 *   - Friendly error messages distinguishing 401/403/429/503/etc.
 */
(function () {
  const BASE = 'https://api.deepseek.com';

  // -------- helpers --------

  function key() {
    const k = window.APP_CONFIG && window.APP_CONFIG.DEEPSEEK_API_KEY;
    if (!k || k.startsWith('PASTE_')) {
      throw new Error('DeepSeek API key not configured. Open Settings and paste your key from https://platform.deepseek.com/api_keys');
    }
    return k;
  }

  function fastModel() {
    return (window.APP_CONFIG && window.APP_CONFIG.DEEPSEEK_MODEL_FAST) || 'deepseek-v4-flash';
  }
  function deepModel() {
    return (window.APP_CONFIG && window.APP_CONFIG.DEEPSEEK_MODEL_DEEP) || 'deepseek-v4-pro';
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /**
   * Permissive JSON parser. DeepSeek sometimes wraps JSON in ```json fences,
   * sometimes adds a preamble like "Here is the result:". This extracts
   * the substring from the first '{' to the last '}'.
   */
  function parseLooseJSON(text) {
    if (!text) throw new Error('Empty response from DeepSeek');
    // Try fast path first: clean fences
    const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    try { return JSON.parse(cleaned); } catch (_) {}
    // Fallback: substring between first { and last }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      console.error('No JSON braces found in response:', text);
      throw new Error('DeepSeek returned no JSON. Try again.');
    }
    const slice = text.substring(start, end + 1);
    try { return JSON.parse(slice); }
    catch (e) {
      console.error('JSON parse failed. Raw text:', text);
      throw new Error('Failed to parse JSON from DeepSeek.');
    }
  }

  /**
   * Friendly translation of HTTP status → user message.
   */
  function friendlyError(status, body) {
    if (status === 400) return 'Bad request to DeepSeek (400). The prompt may be malformed or too long.';
    if (status === 401 || status === 403) {
      return 'DeepSeek rejected the API key (' + status + '). Open Settings, check the key is correct, ' +
             'and verify it works at https://platform.deepseek.com/api_keys.';
    }
    if (status === 429) {
      let retrySec = null;
      const m = body && body.match(/retry in ([\d.]+)s/i);
      if (m) retrySec = Math.ceil(parseFloat(m[1]));
      return 'DeepSeek rate limit hit (429). ' +
             (retrySec ? `Wait ${retrySec}s and retry. ` : 'Wait ~60s. ');
    }
    if (status === 500) return 'DeepSeek internal error (500). Usually transient — try again.';
    if (status === 503) return 'DeepSeek servers are overloaded (503). Try again in a few seconds.';
    return 'DeepSeek API error ' + status + '. ' + (body ? body.slice(0, 200) : '');
  }

  // -------- low-level call with retry --------

  /**
   * Single fetch attempt. Returns { text } or throws an error with .status set.
   * Uses OpenAI-compatible chat completions endpoint.
   */
  async function callRaw({ model, prompt, systemInstruction, jsonMode, temperature, maxTokens }) {
    const messages = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });

    const body = {
      model,
      messages,
      temperature: temperature ?? 0.4,
      max_tokens: maxTokens ?? 2048,
    };
    if (jsonMode) body.response_format = { type: 'json_object' };

    const url = `${BASE}/v1/chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key()}`,
      },
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
    const text = data?.choices?.[0]?.message?.content || '';
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
        let waitMs = delays[attempt];
        const m = e.body && e.body.match(/retry in ([\d.]+)s/i);
        if (m && e.status === 429) {
          waitMs = Math.min(Math.ceil(parseFloat(m[1])) * 1000, 30000);
        }
        console.warn(`[DeepSeek] ${e.status} on ${args.model}, retry ${attempt + 1}/${delays.length} in ${waitMs}ms`);
        await sleep(waitMs);
      }
    }
    throw lastErr;
  }

  /**
   * High-level generate. Auto-falls-back PRO→FLASH when the requested
   * model is quota-exhausted (persistent 429).
   */
  async function generate({ model, prompt, systemInstruction, jsonMode = false, temperature = 0.4, maxTokens = 2048 }) {
    const requested = model || fastModel();
    let result;
    try {
      result = await callWithRetry({ model: requested, prompt, systemInstruction, jsonMode, temperature, maxTokens });
    } catch (e) {
      const isQuota = e.status === 429 || (e.body && /insufficient_quota|rate_limit/i.test(e.body));
      if (isQuota && requested !== fastModel()) {
        console.warn(`[DeepSeek] ${requested} exhausted; falling back to ${fastModel()}`);
        result = await callWithRetry({ model: fastModel(), prompt, systemInstruction, jsonMode, temperature, maxTokens });
      } else {
        throw e;
      }
    }
    if (jsonMode) return parseLooseJSON(result.text);
    return result.text;
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

  // -------- expose as window.DeepSeek (replaces window.Gemini) --------

  window.DeepSeek = {
    generate,
    analyzeWriting, rewriteText, explainIssue, detectItalianInterference,
    mirrorCompare, earningsScore, generateChallenge, placementTest,
  };
})();
