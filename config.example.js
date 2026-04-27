/**
 * config.example.js — committable template.
 * Copy to config.local.js (or just keep this; the runtime is identical).
 *
 * The Gemini API key is read from localStorage, NOT from this file.
 * Set the key in the app's Settings panel after first load.
 */
(function () {
  const LS_KEY = 'englishCoach.geminiApiKey';
  const ls = (typeof localStorage !== 'undefined') ? localStorage.getItem(LS_KEY) : null;

  window.APP_CONFIG = {
    GEMINI_API_KEY: ls || '',
    GEMINI_API_KEY_LS_KEY: LS_KEY,

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
