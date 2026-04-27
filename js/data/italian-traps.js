/**
 * italian-traps.js — Italian → English interference patterns.
 * Used by the local quick-detect (before LLM) and the dedicated Italian Interference module.
 */
window.ITALIAN_TRAPS = {
  false_friends: [
    { it: 'attualmente', wrong_en: 'actually', correct_en: 'currently', note: 'actually = in realtà' },
    { it: 'eventualmente', wrong_en: 'eventually', correct_en: 'if necessary / possibly', note: 'eventually = alla fine' },
    { it: 'sensibile', wrong_en: 'sensible', correct_en: 'sensitive', note: 'sensible = ragionevole' },
    { it: 'argomento', wrong_en: 'argument', correct_en: 'topic / subject', note: 'argument = discussione' },
    { it: 'libreria', wrong_en: 'library', correct_en: 'bookshop', note: 'library = biblioteca' },
    { it: 'fattoria', wrong_en: 'factory', correct_en: 'farm', note: 'factory = fabbrica' },
    { it: 'educazione', wrong_en: 'education', correct_en: 'manners / upbringing', note: 'education = istruzione' },
    { it: 'attendere', wrong_en: 'attend', correct_en: 'wait', note: 'attend = partecipare' },
    { it: 'assistere a', wrong_en: 'assist', correct_en: 'attend / be present at', note: 'assist = aiutare' },
    { it: 'realizzare', wrong_en: 'realize', correct_en: 'achieve / make', note: 'realize = rendersi conto' },
    { it: 'parente', wrong_en: 'parent', correct_en: 'relative', note: 'parent = genitore' },
    { it: 'pretendere', wrong_en: 'pretend', correct_en: 'demand / claim', note: 'pretend = fingere' },
    { it: 'controllare', wrong_en: 'control', correct_en: 'check', note: 'control = avere controllo' },
    { it: 'confrontare', wrong_en: 'confront', correct_en: 'compare', note: 'confront = affrontare' },
    { it: 'conveniente', wrong_en: 'convenient', correct_en: 'cheap / affordable', note: 'convenient = comodo' },
    { it: 'morbido', wrong_en: 'morbid', correct_en: 'soft', note: 'morbid = morboso' },
    { it: 'ostrica', wrong_en: 'ostrich', correct_en: 'oyster', note: 'ostrich = struzzo' },
    { it: 'fabbrica', wrong_en: 'fabric', correct_en: 'factory', note: 'fabric = tessuto' },
    { it: 'magazzino', wrong_en: 'magazine', correct_en: 'warehouse', note: 'magazine = rivista' },
    { it: 'incidente', wrong_en: 'incident', correct_en: 'accident', note: 'incident = episodio (lieve)' },
    { it: 'rumore', wrong_en: 'rumor', correct_en: 'noise', note: 'rumor = pettegolezzo' },
    { it: 'simpatico', wrong_en: 'sympathetic', correct_en: 'nice / friendly', note: 'sympathetic = comprensivo' },
    { it: 'eccitato', wrong_en: 'excited (in some contexts)', correct_en: 'use carefully — often "looking forward to" is safer', note: 'eccitato can have sexual undertone in EN' },
    { it: 'preservativo', wrong_en: 'preservative', correct_en: 'condom', note: 'preservative = conservante' },
  ],

  preposition_traps: [
    { pattern: /\bdepend\s+from\b/gi, fix: 'depend on', note: 'In English: "depend ON".' },
    { pattern: /\bconsist\s+in\b/gi, fix: 'consist of (for components) / lie in (for meaning)', note: 'consist OF + components.' },
    { pattern: /\bdiscuss\s+about\b/gi, fix: 'discuss', note: 'In English do not use ABOUT after discuss.' },
    { pattern: /\brequest\s+for\b(?!\s+(comment|information))/gi, fix: 'request', note: 'No FOR after request as verb.' },
    { pattern: /\bin\s+line\s+of\b/gi, fix: 'in line with', note: 'In line WITH.' },
    { pattern: /\bsimilar\s+(of|at)\b/gi, fix: 'similar to', note: 'Similar TO.' },
    { pattern: /\bdifferent\s+(of|that|than)\b/gi, fix: 'different from', note: 'Different FROM.' },
    { pattern: /\bmarried\s+with\b/gi, fix: 'married to', note: 'Married TO a person.' },
    { pattern: /\bgood\s+in\s+(\w+ing|\w+ics|\w+s)\b/gi, fix: 'good at', note: 'Good AT for skills.' },
    { pattern: /\binterested\s+to\b/gi, fix: 'interested in', note: 'Interested IN.' },
    { pattern: /\bafraid\s+from\b/gi, fix: 'afraid of', note: 'Afraid OF.' },
    { pattern: /\bcapable\s+to\b/gi, fix: 'capable of', note: 'Capable OF.' },
    { pattern: /\baccording\s+(of|with)\b/gi, fix: 'according to', note: 'According TO.' },
    { pattern: /\bbenefit\s+(by|to)\s+/gi, fix: 'benefit from', note: 'Benefit FROM.' },
    { pattern: /\bcomposed\s+by\b/gi, fix: 'composed of', note: 'Composed OF.' },
    { pattern: /\bresponsible\s+(to|by)\s+/gi, fix: 'responsible for', note: 'Responsible FOR (a thing).' },
    { pattern: /\bsuffer\s+(by|of)\b/gi, fix: 'suffer from', note: 'Suffer FROM.' },
  ],

  calques: [
    { pattern: /\bmake\s+a\s+question\b/gi, fix: 'ask a question', note: 'Italian "fare una domanda" → "ask".' },
    { pattern: /\bmake\s+a\s+photo\b/gi, fix: 'take a photo', note: '"Fare una foto" → "take".' },
    { pattern: /\btake\s+a\s+decision\b/gi, fix: 'make a decision', note: '"Prendere una decisione" → "make".' },
    { pattern: /\bI\s+have\s+\d+\s+years\b/gi, fix: 'I am X years old', note: 'Use BE for age.' },
    { pattern: /\bsince\s+\d+\s+years\b/gi, fix: 'for X years', note: 'Use FOR with a duration.' },
    { pattern: /\bin\s+the\s+morning\s+of\s+\w+day\b/gi, fix: 'on X morning', note: 'Use ON with weekday.' },
    { pattern: /\bin\s+the\s+last\s+years\b/gi, fix: 'in the last few years / over the past years', note: 'Add "few" or rephrase.' },
    { pattern: /\bmake\s+a\s+research\b/gi, fix: 'do research / conduct research', note: 'Research is uncountable.' },
    { pattern: /\binformations\b/gi, fix: 'information', note: 'Information is uncountable.' },
    { pattern: /\badvices\b/gi, fix: 'advice', note: 'Advice is uncountable.' },
    { pattern: /\bnewses\b/gi, fix: 'news / piece of news', note: 'News is uncountable.' },
    { pattern: /\bevidences\b/gi, fix: 'evidence / pieces of evidence', note: 'Evidence is uncountable.' },
    { pattern: /\bequipments\b/gi, fix: 'equipment', note: 'Equipment is uncountable.' },
    { pattern: /\bsuggest\s+(me|him|her|us|them)\s+to\b/gi, fix: 'suggest that I/he/she/we/they (verb)', note: '"Suggest" doesn\'t take direct object + to-infinitive.' },
    { pattern: /\bexplain\s+(me|him|her|us|them)\s+/gi, fix: 'explain (something) to me/him/her', note: 'Explain TO someone.' },
    { pattern: /\blet\s+me\s+to\s+(know|see)\b/gi, fix: 'let me know / let me see', note: 'After LET, no TO.' },
    { pattern: /\bI'm\s+agree\b/gi, fix: 'I agree', note: 'Agree is a verb, not adjective.' },
    { pattern: /\bI'm\s+born\s+in\b/gi, fix: 'I was born in', note: 'Past simple for birth.' },
  ],

  word_order: [
    { pattern: /\b(very|really|quite)\s+much\b/gi, fix: 'reorder: "very much" goes after the verb (e.g. "I like it very much"), not before quantifiers', note: 'Word order issue.' },
  ],
};

/**
 * Quick local scan for Italian traps — runs in browser without API calls.
 * Returns issues in unified format.
 */
window.scanItalianTraps = function (text) {
  if (!text) return [];
  const issues = [];

  // Preposition + calque patterns
  const all = [
    ...window.ITALIAN_TRAPS.preposition_traps.map((p) => ({ ...p, type: 'preposition' })),
    ...window.ITALIAN_TRAPS.calques.map((p) => ({ ...p, type: 'calque' })),
    ...window.ITALIAN_TRAPS.word_order.map((p) => ({ ...p, type: 'word_order' })),
  ];

  for (const { pattern, fix, note, type } of all) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      issues.push({
        category: 'italian_interference',
        severity: 'medium',
        original: match[0],
        suggestion: fix,
        explanation: note,
        rule: `Italian ${type}`,
        offset: match.index,
        length: match[0].length,
        source: 'local',
      });
      if (!pattern.global) break;
    }
  }
  return issues;
};
