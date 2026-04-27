/**
 * srs.js — Spaced Repetition System.
 *
 * Implements a simplified FSRS (Free Spaced Repetition Scheduler) — more modern
 * and accurate than SM-2. We keep it simple but tunable.
 *
 * Card state:
 *   { vocabId, stability, difficulty, lastReview, dueDate, reps, lapses, state }
 *   state: 0=new, 1=learning, 2=review, 3=relearning
 *
 * Rating: 1=Again, 2=Hard, 3=Good, 4=Easy
 */
(function () {
  // FSRS-lite parameters (defaults are reasonable)
  const W = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61];

  const REQ_RETENTION = 0.9; // 90% target retention
  const FACTOR = 19/81;

  function newCard(vocabId) {
    return {
      vocabId, stability: 0, difficulty: 0,
      lastReview: null, dueDate: new Date().toISOString(),
      reps: 0, lapses: 0, state: 0,
    };
  }

  function _initStability(rating) {
    return Math.max(W[rating - 1], 0.1);
  }
  function _initDifficulty(rating) {
    return Math.min(Math.max(W[4] - (rating - 3) * W[5], 1), 10);
  }
  function _nextDifficulty(d, rating) {
    const dPrime = d - W[6] * (rating - 3);
    return Math.min(Math.max(W[7] * 5 + (1 - W[7]) * dPrime, 1), 10);
  }
  function _nextStability(d, s, retrievability, rating) {
    if (rating === 1) {
      return W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - retrievability));
    }
    const hardPenalty = rating === 2 ? W[15] : 1;
    const easyBonus = rating === 4 ? W[16] : 1;
    return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp((1 - retrievability) * W[10]) - 1) * hardPenalty * easyBonus);
  }
  function _retrievability(elapsedDays, stability) {
    if (stability <= 0) return 1;
    return Math.pow(1 + FACTOR * elapsedDays / stability, -1);
  }
  function _interval(stability) {
    const i = stability / FACTOR * (Math.pow(REQ_RETENTION, -1) - 1);
    return Math.max(1, Math.round(i));
  }

  /**
   * Process a review and return the updated card.
   */
  function review(card, rating, now = new Date()) {
    if (!card) throw new Error('No card');
    if (rating < 1 || rating > 4) throw new Error('Rating must be 1-4');

    const last = card.lastReview ? new Date(card.lastReview) : now;
    const elapsedDays = Math.max(0, (now - last) / (1000 * 60 * 60 * 24));

    let { stability, difficulty, state, reps, lapses } = card;

    if (state === 0) {
      // First review
      stability = _initStability(rating);
      difficulty = _initDifficulty(rating);
      state = rating === 1 ? 1 : 2;
      reps = 1;
    } else {
      const r = _retrievability(elapsedDays, stability);
      difficulty = _nextDifficulty(difficulty, rating);
      stability = _nextStability(difficulty, stability, r, rating);
      reps += 1;
      if (rating === 1) {
        lapses += 1;
        state = 3;
      } else {
        state = 2;
      }
    }

    const intervalDays = _interval(stability);
    const due = new Date(now);
    due.setDate(due.getDate() + intervalDays);

    return {
      ...card,
      stability, difficulty, state, reps, lapses,
      lastReview: now.toISOString(),
      dueDate: due.toISOString(),
    };
  }

  function isDue(card, now = new Date()) {
    if (!card || !card.dueDate) return true;
    return new Date(card.dueDate) <= now;
  }

  /**
   * Get cards due now or earlier, sorted by due date.
   */
  async function getDueCards(limit = 20) {
    const all = await window.Storage.getAll('srs');
    const now = new Date();
    const due = all.filter((c) => isDue(c, now))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, limit);
    return due;
  }

  async function ensureCardForVocab(vocabId) {
    let card = await window.Storage.get('srs', vocabId);
    if (!card) {
      card = newCard(vocabId);
      await window.Storage.put('srs', card);
    }
    return card;
  }

  async function recordReview(vocabId, rating) {
    const card = await ensureCardForVocab(vocabId);
    const updated = review(card, rating);
    await window.Storage.put('srs', updated);
    return updated;
  }

  window.SRS = { newCard, review, isDue, getDueCards, ensureCardForVocab, recordReview };
})();
