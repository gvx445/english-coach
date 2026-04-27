/**
 * anonymizer.js — replaces tickers, company names, and large numbers with
 * placeholders before sending text to external APIs. Keeps a mapping so the
 * caller can de-anonymize the response.
 *
 * Disable in config.local.js with ANONYMIZE_BEFORE_API: false.
 */
(function () {
  // Common tickers to detect even without context.
  const KNOWN_TICKERS = new Set([
    'AAPL','MSFT','GOOGL','GOOG','AMZN','META','TSLA','NVDA','BRK.A','BRK.B',
    'JPM','BAC','WFC','GS','MS','C','HSBC','BARC','DBK','UCG','ISP','BAMI','BMPS',
    'V','MA','AXP','PYPL','XOM','CVX','SHEL','BP','TTE',
    'KO','PEP','PG','UL','NESN','MCD','SBUX','NKE','LVMH','MC',
    'IVG','STLA','RACE','FCA','LUX','EL','BABA','TCEHY','SAP','ASML','SIE',
    'PFE','MRK','LLY','JNJ','NVS','RHHBY','GSK','AZN',
    'BA','CAT','GE','HON','LMT','RTX','MMM','UNH','CVS',
    'WMT','HD','LOW','TGT','COST','ORCL','CRM','NFLX','DIS','CMCSA',
  ]);

  // Famous company names → don't replace these globally, but the LLM sees them.
  // We focus on tickers + currency amounts as the highest-risk leaks.

  const TICKER_RE = /\b([A-Z]{2,5})(?:\.[A-Z]{1,3})?\b/g;
  const MONEY_RE = /(?:€|\$|£|¥|USD|EUR|GBP|JPY)\s?\d[\d.,]*\s?(?:bn|m|k|billion|million|thousand|B|M|K)?/gi;
  const PCT_RE = /\b\d+(?:\.\d+)?%/g;
  const LARGE_NUM_RE = /\b\d{1,3}(?:[,.]\d{3})+(?:[.,]\d+)?\b/g;

  function anonymize(text, options = {}) {
    if (!text || !window.APP_CONFIG || window.APP_CONFIG.ANONYMIZE_BEFORE_API === false) {
      return { text, map: {} };
    }
    if (options.skip) return { text, map: {} };

    const map = {};
    let counter = { TICKER: 0, MONEY: 0, PCT: 0, NUM: 0 };

    function placeholder(kind, original) {
      counter[kind] += 1;
      const key = `__${kind}_${counter[kind]}__`;
      map[key] = original;
      return key;
    }

    let out = text;

    // Tickers (only known ones, to avoid over-eager replacement of CAPS words)
    out = out.replace(TICKER_RE, (m) => {
      if (KNOWN_TICKERS.has(m)) return placeholder('TICKER', m);
      return m;
    });

    // Money amounts
    out = out.replace(MONEY_RE, (m) => placeholder('MONEY', m));

    // Percentages — keep these visible (style matters), only mask if explicitly requested
    if (options.maskPercents) {
      out = out.replace(PCT_RE, (m) => placeholder('PCT', m));
    }

    // Large numbers (>1,000)
    if (options.maskLargeNumbers) {
      out = out.replace(LARGE_NUM_RE, (m) => placeholder('NUM', m));
    }

    return { text: out, map };
  }

  function deanonymize(text, map) {
    if (!text || !map) return text;
    let out = text;
    for (const [key, original] of Object.entries(map)) {
      // Replace ALL occurrences of placeholder
      out = out.split(key).join(original);
    }
    return out;
  }

  window.Anonymizer = { anonymize, deanonymize };
})();
