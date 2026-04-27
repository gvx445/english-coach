/**
 * config.local.js — runtime configuration.
 *
 * The Gemini API key is NOT stored in this file. It lives in the browser's
 * localStorage, set via the in-app Settings panel. This means:
 *  - Safe to commit / publish online (e.g. GitHub Pages, Netlify)
 *  - Each device (laptop, phone) has its own key, set once
 *  - Clearing browser data wipes the key (re-enter in Settings)
 *
 * On first load the app will prompt for the key in Settings if missing.
 */
(function () {
  const LS_KEY = 'englishCoach.geminiApiKey';
  const ls = (typeof localStorage !== 'undefined') ? localStorage.getItem(LS_KEY) : null;

  window.APP_CONFIG = {
    // API key: read from localStorage at startup. Empty string means "not set".
    GEMINI_API_KEY: ls || '',
    GEMINI_API_KEY_LS_KEY: LS_KEY, // exposed so Settings.js can read/write it

    // Free-tier models (verified April 2026)
    GEMINI_MODEL_FAST: "gemini-2.5-flash-lite",
    GEMINI_MODEL_DEEP: "gemini-2.5-flash",
    GEMINI_MODEL_EMBED: "text-embedding-004",

    LANGUAGETOOL_URL: "https://api.languagetool.org/v2/check",

    DEFAULT_CEFR: "B2",
    ANONYMIZE_BEFORE_API: true,
    AUTO_SAVE_DEBOUNCE: 800,
    ANALYSIS_DEBOUNCE: 1500,
  };
})();
