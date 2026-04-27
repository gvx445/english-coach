/**
 * cefr.js — CEFR level utilities.
 */
window.CEFR = {
  levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],

  isAtLeast(current, target) {
    const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    return order.indexOf(current) >= order.indexOf(target);
  },

  description(level) {
    const map = {
      A1: 'Beginner',
      A2: 'Elementary',
      B1: 'Intermediate',
      B2: 'Upper-Intermediate',
      C1: 'Advanced',
      C2: 'Mastery',
    };
    return map[level] || level;
  },

  next(level) {
    const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const i = order.indexOf(level);
    return order[Math.min(i + 1, order.length - 1)];
  },
};
