/**
 * languageTool.js — wrapper for the LanguageTool grammar API.
 * Free public endpoint: 20 req/min, 20kb max per request.
 * Docs: https://languagetool.org/http-api/
 */
(function () {
  function url() {
    return (window.APP_CONFIG && window.APP_CONFIG.LANGUAGETOOL_URL)
      || 'https://api.languagetool.org/v2/check';
  }

  /**
   * Check text for grammar/spelling/style issues.
   * Returns: { matches: [{ message, offset, length, replacements:[{value}], rule:{...} }] }
   */
  async function check(text, language = 'en-US') {
    if (!text || !text.trim()) return { matches: [] };

    const params = new URLSearchParams();
    params.append('text', text);
    params.append('language', language);
    params.append('enabledOnly', 'false');

    const res = await fetch(url(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!res.ok) {
      console.warn('LanguageTool error', res.status);
      return { matches: [] };
    }
    return res.json();
  }

  /**
   * Convert LT matches to our unified issue format.
   */
  function toIssues(ltResult, fullText) {
    if (!ltResult || !Array.isArray(ltResult.matches)) return [];
    return ltResult.matches.map((m) => {
      const original = fullText.substr(m.offset, m.length);
      const suggestion = m.replacements && m.replacements[0] ? m.replacements[0].value : '';
      const ruleCat = (m.rule && m.rule.category && m.rule.category.id) || 'GRAMMAR';
      let category = 'grammar';
      if (ruleCat.includes('STYLE') || ruleCat.includes('REDUNDANCY')) category = 'style';
      if (ruleCat.includes('TYPOS') || ruleCat.includes('SPELL')) category = 'grammar';
      return {
        category,
        original,
        suggestion,
        explanation: m.message,
        offset: m.offset,
        length: m.length,
        source: 'languagetool',
        ruleId: m.rule && m.rule.id,
      };
    });
  }

  window.LanguageTool = { check, toIssues };
})();
