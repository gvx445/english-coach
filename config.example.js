/**
 * config.example.js — committable template.
 * Copy to config.local.js (or just keep this; the runtime is identical).
 *
 * The DeepSeek API key is read from localStorage, NOT from this file.
 * Set the key in the app's Settings panel after first load.
 */
(function () {
  const LS_KEY = 'englishCoach.deepseekApiKey';
  const ls = (typeof localStorage !== 'undefined') ? localStorage.getItem(LS_KEY) : null;

  window.APP_CONFIG = {
    DEEPSEEK_API_KEY: ls || '',
    DEEPSEEK_API_KEY_LS_KEY: LS_KEY,

    DEEPSEEK_MODEL_FAST: "deepseek-chat",
    DEEPSEEK_MODEL_DEEP: "deepseek-reasoner",

    LANGUAGETOOL_URL: "https://api.languagetool.org/v2/check",

    DEFAULT_CEFR: "B2",
    ANONYMIZE_BEFORE_API: true,
    AUTO_SAVE_DEBOUNCE: 800,
    ANALYSIS_DEBOUNCE: 1500,
  };
})();
