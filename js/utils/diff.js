/**
 * diff.js — word-level diff for mirror-writing comparisons.
 * Implementation: longest-common-subsequence based.
 */
(function () {
  function tokenize(text) {
    // Split into words + spaces + punctuation, preserving them as tokens.
    return text.match(/(\s+|\w+|[^\s\w]+)/g) || [];
  }

  function lcs(a, b) {
    const n = a.length, m = b.length;
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp;
  }

  /**
   * Returns [{ type: 'equal' | 'insert' | 'delete', text }]
   * a = original, b = user's version
   * type 'insert' = added in b (user wrote extra)
   * type 'delete' = present in a but missing in b (user missed)
   */
  function diff(a, b) {
    const at = tokenize(a);
    const bt = tokenize(b);
    const dp = lcs(at, bt);
    const out = [];
    let i = at.length, j = bt.length;
    while (i > 0 && j > 0) {
      if (at[i - 1] === bt[j - 1]) {
        out.push({ type: 'equal', text: at[i - 1] });
        i--; j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        out.push({ type: 'delete', text: at[i - 1] });
        i--;
      } else {
        out.push({ type: 'insert', text: bt[j - 1] });
        j--;
      }
    }
    while (i > 0) { out.push({ type: 'delete', text: at[i - 1] }); i--; }
    while (j > 0) { out.push({ type: 'insert', text: bt[j - 1] }); j--; }
    return out.reverse();
  }

  function similarity(a, b) {
    const at = tokenize(a).filter((t) => /\w/.test(t));
    const bt = tokenize(b).filter((t) => /\w/.test(t));
    const dp = lcs(at, bt);
    const lcsLen = dp[at.length][bt.length];
    return Math.round((2 * lcsLen) / (at.length + bt.length) * 100);
  }

  window.Diff = { tokenize, diff, similarity };
})();
