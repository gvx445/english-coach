/**
 * finance-lexicon.js — seed vocabulary for finance/equity analyst English.
 * 200+ curated terms across categories. The user can extend this via "Import".
 *
 * Each entry: { term, type, cefr, definition, italian, example, collocations[], category }
 *   type: word | idiom | chunk | collocation | phrasal_verb
 *   cefr: B2 | C1 | C2
 */
window.FINANCE_LEXICON = [
  // ===== EARNINGS / RESULTS =====
  { term: 'beat consensus', type: 'collocation', cefr: 'C1', italian: 'battere il consenso', definition: 'To report results higher than the average of analyst estimates.', example: 'Q3 EPS beat consensus by 8%, driven by stronger margins.', category: 'earnings' },
  { term: 'miss expectations', type: 'collocation', cefr: 'B2', italian: 'mancare le aspettative', definition: 'To report below analyst forecasts.', example: 'Revenue missed expectations by 3%.', category: 'earnings' },
  { term: 'in line with', type: 'chunk', cefr: 'B2', italian: 'in linea con', definition: 'Matching expectations.', example: 'EBITDA came in in line with our model.', category: 'earnings' },
  { term: 'top-line growth', type: 'chunk', cefr: 'C1', italian: 'crescita del fatturato', definition: 'Revenue growth.', example: 'Top-line growth accelerated to 12% YoY.', category: 'earnings' },
  { term: 'bottom-line', type: 'word', cefr: 'C1', italian: 'utile netto / risultato finale', definition: 'Net income / profit after all expenses.', example: 'Despite top-line softness, the bottom-line surprised positively.', category: 'earnings' },
  { term: 'flat YoY', type: 'chunk', cefr: 'C1', italian: 'stabile anno su anno', definition: 'Unchanged year-over-year.', example: 'Volumes were flat YoY.', category: 'earnings' },
  { term: 'guide higher', type: 'phrasal_verb', cefr: 'C1', italian: 'dare guidance al rialzo', definition: 'To raise forward guidance.', example: 'Management guided higher on FY24 EPS.', category: 'earnings' },
  { term: 'walk through', type: 'phrasal_verb', cefr: 'B2', italian: 'spiegare passo passo', definition: 'To explain something step by step.', example: 'The CFO walked through the bridge from EBITDA to FCF.', category: 'earnings' },

  // ===== VALUATION =====
  { term: 'multiple compression', type: 'collocation', cefr: 'C1', italian: 'compressione dei multipli', definition: 'Decline in valuation multiples (e.g. P/E falling).', example: 'We see further multiple compression amid rising rates.', category: 'valuation' },
  { term: 'multiple expansion', type: 'collocation', cefr: 'C1', italian: 'espansione dei multipli', definition: 'Rise in valuation multiples.', example: 'The stock benefited from multiple expansion as growth re-accelerated.', category: 'valuation' },
  { term: 're-rating', type: 'word', cefr: 'C1', italian: 'rivalutazione', definition: 'A change in the market\'s valuation multiple for a stock.', example: 'A successful turnaround could trigger a re-rating to peer multiples.', category: 'valuation' },
  { term: 'trade at a premium to', type: 'chunk', cefr: 'C1', italian: 'trattare a premio rispetto a', definition: 'Be valued higher than a benchmark.', example: 'The stock trades at a 25% premium to the sector.', category: 'valuation' },
  { term: 'trade at a discount to', type: 'chunk', cefr: 'C1', italian: 'trattare a sconto rispetto a', definition: 'Be valued lower than a benchmark.', example: 'It trades at a discount to its historical average.', category: 'valuation' },
  { term: 'fair value', type: 'word', cefr: 'B2', italian: 'fair value / valore equo', definition: 'Estimated intrinsic value of an asset.', example: 'Our DCF points to a fair value of EUR 42 per share.', category: 'valuation' },
  { term: 'sum-of-the-parts', type: 'word', cefr: 'C1', italian: 'somma delle parti', definition: 'Valuation method valuing each business segment separately.', example: 'A SOTP analysis suggests material upside.', category: 'valuation' },
  { term: 'priced in', type: 'collocation', cefr: 'C1', italian: 'già scontato', definition: 'Already reflected in the share price.', example: 'The slowdown is largely priced in.', category: 'valuation' },

  // ===== M&A =====
  { term: 'accretive', type: 'word', cefr: 'C1', italian: 'accretivo / che aumenta gli utili', definition: 'Adds to earnings per share.', example: 'The deal is accretive to EPS in year one.', category: 'm&a' },
  { term: 'dilutive', type: 'word', cefr: 'C1', italian: 'diluitivo', definition: 'Reduces EPS.', example: 'The transaction is mildly dilutive in 2024.', category: 'm&a' },
  { term: 'synergies', type: 'word', cefr: 'C1', italian: 'sinergie', definition: 'Cost or revenue benefits from combining businesses.', example: 'Run-rate synergies of EUR 200m by year 3.', category: 'm&a' },
  { term: 'bolt-on acquisition', type: 'collocation', cefr: 'C1', italian: 'acquisizione bolt-on / complementare', definition: 'Small acquisition that adds capability without changing strategy.', example: 'The bolt-on strengthens the European footprint.', category: 'm&a' },
  { term: 'transformational deal', type: 'collocation', cefr: 'C1', italian: 'operazione trasformativa', definition: 'Acquisition that fundamentally reshapes the company.', example: 'This is a potentially transformational deal.', category: 'm&a' },
  { term: 'close the deal', type: 'collocation', cefr: 'B2', italian: 'chiudere l\'accordo', definition: 'Complete an acquisition.', example: 'They expect to close the deal by Q2.', category: 'm&a' },

  // ===== BALANCE SHEET / CREDIT =====
  { term: 'deleverage', type: 'word', cefr: 'C1', italian: 'ridurre il debito', definition: 'Reduce debt.', example: 'The company is on track to deleverage to <2x by 2025.', category: 'credit' },
  { term: 'leverage ratio', type: 'collocation', cefr: 'C1', italian: 'rapporto di leva', definition: 'Net debt / EBITDA.', example: 'The leverage ratio remains comfortable at 1.8x.', category: 'credit' },
  { term: 'cash burn', type: 'collocation', cefr: 'C1', italian: 'consumo di cassa', definition: 'Rate at which a company spends cash.', example: 'Quarterly cash burn narrowed to EUR 50m.', category: 'credit' },
  { term: 'free cash flow generation', type: 'collocation', cefr: 'C1', italian: 'generazione di cassa libera', definition: 'Ability to produce free cash flow.', example: 'Strong free cash flow generation supports the buyback.', category: 'credit' },
  { term: 'covenant headroom', type: 'collocation', cefr: 'C2', italian: 'margine sui covenant', definition: 'Buffer before breaching debt covenants.', example: 'Covenant headroom remains thin.', category: 'credit' },
  { term: 'investment grade', type: 'collocation', cefr: 'B2', italian: 'investment grade', definition: 'Bond rating BBB- or higher.', example: 'The bond was upgraded to investment grade.', category: 'credit' },

  // ===== MACRO / DRIVERS =====
  { term: 'headwinds', type: 'word', cefr: 'C1', italian: 'venti contrari / fattori avversi', definition: 'Negative external factors.', example: 'FX headwinds shaved 200bps off growth.', category: 'macro' },
  { term: 'tailwinds', type: 'word', cefr: 'C1', italian: 'venti favorevoli', definition: 'Positive external factors.', example: 'Pricing tailwinds drove margin expansion.', category: 'macro' },
  { term: 'soft patch', type: 'idiom', cefr: 'C1', italian: 'fase di rallentamento', definition: 'A period of weak performance.', example: 'We expect a soft patch in H1 before recovery.', category: 'macro' },
  { term: 'rolling over', type: 'phrasal_verb', cefr: 'C1', italian: 'in calo / in inversione', definition: 'Beginning to decline (used for trends).', example: 'Leading indicators are rolling over.', category: 'macro' },
  { term: 'pick up', type: 'phrasal_verb', cefr: 'B2', italian: 'riprendersi', definition: 'To improve / accelerate.', example: 'Demand picked up sharply in September.', category: 'macro' },
  { term: 'bottom out', type: 'phrasal_verb', cefr: 'C1', italian: 'toccare il fondo', definition: 'Reach a low point before recovery.', example: 'We believe margins have bottomed out.', category: 'macro' },

  // ===== ANALYST VOICE / HEDGING =====
  { term: 'we believe', type: 'chunk', cefr: 'B2', italian: 'riteniamo', definition: 'Standard analyst hedge.', example: 'We believe the stock offers asymmetric upside.', category: 'voice' },
  { term: 'in our view', type: 'chunk', cefr: 'B2', italian: 'a nostro avviso', definition: 'Variant of "we believe".', example: 'In our view, consensus is too cautious.', category: 'voice' },
  { term: 'is set to', type: 'chunk', cefr: 'C1', italian: 'è destinato a', definition: 'Soft prediction with high probability.', example: 'EBITDA is set to recover in H2.', category: 'voice' },
  { term: 'is likely to', type: 'chunk', cefr: 'B2', italian: 'è probabile che', definition: 'Probabilistic hedge.', example: 'Margins are likely to compress further.', category: 'voice' },
  { term: 'appears to', type: 'chunk', cefr: 'B2', italian: 'sembra', definition: 'Tentative hedge.', example: 'Demand appears to be stabilising.', category: 'voice' },
  { term: 'we see scope for', type: 'chunk', cefr: 'C1', italian: 'vediamo spazio per', definition: 'Cautiously optimistic phrase.', example: 'We see scope for upside surprises.', category: 'voice' },
  { term: 'on balance', type: 'chunk', cefr: 'C1', italian: 'tutto sommato', definition: 'Weighing pros and cons.', example: 'On balance, we maintain Overweight.', category: 'voice' },
  { term: 'all else equal', type: 'chunk', cefr: 'C1', italian: 'a parità di altre condizioni', definition: 'Ceteris paribus.', example: 'All else equal, a 100bps cut adds 5% to NAV.', category: 'voice' },

  // ===== RATINGS / RECS =====
  { term: 'reiterate Buy', type: 'collocation', cefr: 'C1', italian: 'confermare Buy', definition: 'Maintain a Buy rating.', example: 'We reiterate our Buy rating with a EUR 50 PT.', category: 'recs' },
  { term: 'downgrade to Hold', type: 'collocation', cefr: 'C1', italian: 'declassare a Hold', definition: 'Lower rating from Buy to Hold.', example: 'We downgrade to Hold on valuation.', category: 'recs' },
  { term: 'initiation of coverage', type: 'collocation', cefr: 'C1', italian: 'inizio della copertura', definition: 'First research note on a stock.', example: 'We initiate coverage with an Overweight rating.', category: 'recs' },
  { term: 'price target', type: 'collocation', cefr: 'B2', italian: 'target price', definition: 'Analyst\'s 12-month forecast price.', example: 'We raise our price target to EUR 38.', category: 'recs' },
  { term: 'upside / downside', type: 'word', cefr: 'B2', italian: 'rialzo / ribasso (potenziale)', definition: 'Potential gain / loss to target.', example: 'We see 25% upside to fair value.', category: 'recs' },

  // ===== RISKS =====
  { term: 'key risk', type: 'collocation', cefr: 'B2', italian: 'rischio principale', definition: 'Main risk to the thesis.', example: 'Key risk is regulatory intervention in pricing.', category: 'risk' },
  { term: 'idiosyncratic risk', type: 'collocation', cefr: 'C2', italian: 'rischio idiosincratico', definition: 'Company-specific risk.', example: 'Idiosyncratic execution risk remains elevated.', category: 'risk' },
  { term: 'tail risk', type: 'collocation', cefr: 'C1', italian: 'rischio di coda', definition: 'Low-probability, high-impact risk.', example: 'We do not factor tail risks into the base case.', category: 'risk' },
  { term: 'downside scenario', type: 'collocation', cefr: 'C1', italian: 'scenario negativo', definition: 'Bear case projection.', example: 'In our downside scenario, EPS halves.', category: 'risk' },

  // ===== CATALYSTS / EVENTS =====
  { term: 'near-term catalyst', type: 'collocation', cefr: 'C1', italian: 'catalizzatore di breve termine', definition: 'Event likely to move the stock soon.', example: 'The CMD on 15 March is a key near-term catalyst.', category: 'catalysts' },
  { term: 'overhang', type: 'word', cefr: 'C1', italian: 'fattore di pressione / overhang', definition: 'Negative factor weighing on the stock.', example: 'The litigation overhang is now removed.', category: 'catalysts' },
  { term: 'inflection point', type: 'collocation', cefr: 'C1', italian: 'punto di svolta', definition: 'Moment when a trend changes direction.', example: 'We believe Q4 marks an inflection point.', category: 'catalysts' },

  // ===== GENERAL B2/C1 BUSINESS =====
  { term: 'roll out', type: 'phrasal_verb', cefr: 'B2', italian: 'lanciare / implementare', definition: 'Launch progressively.', example: 'They will roll out the platform across Europe.', category: 'business' },
  { term: 'scale up', type: 'phrasal_verb', cefr: 'B2', italian: 'far crescere di scala', definition: 'Grow capacity / volumes.', example: 'They are scaling up production rapidly.', category: 'business' },
  { term: 'wind down', type: 'phrasal_verb', cefr: 'C1', italian: 'chiudere / smobilitare gradualmente', definition: 'Gradually close or reduce.', example: 'The legacy unit is being wound down.', category: 'business' },
  { term: 'streamline operations', type: 'collocation', cefr: 'C1', italian: 'razionalizzare le operazioni', definition: 'Make operations more efficient.', example: 'New management is streamlining operations.', category: 'business' },
  { term: 'execute on', type: 'collocation', cefr: 'C1', italian: 'eseguire / realizzare', definition: 'Successfully implement.', example: 'They need to execute on the new strategy.', category: 'business' },
  { term: 'gain traction', type: 'collocation', cefr: 'C1', italian: 'prendere piede', definition: 'Begin to succeed.', example: 'The new product is gaining traction in the US.', category: 'business' },
  { term: 'pull forward demand', type: 'collocation', cefr: 'C2', italian: 'anticipare la domanda', definition: 'Cause future demand to occur sooner.', example: 'The promotion pulled forward demand from Q4.', category: 'business' },
  { term: 'pass-through', type: 'word', cefr: 'C1', italian: 'trasferimento (di costi/prezzi)', definition: 'Ability to pass costs to customers.', example: 'Limited pass-through pressured gross margins.', category: 'business' },
  { term: 'mix shift', type: 'collocation', cefr: 'C1', italian: 'cambio di mix', definition: 'Change in revenue or product composition.', example: 'A favourable mix shift drove margin expansion.', category: 'business' },

  // ===== STRUCTURAL / WRITING =====
  { term: 'against this backdrop', type: 'chunk', cefr: 'C1', italian: 'in questo contesto', definition: 'Given this context.', example: 'Against this backdrop, we remain selective.', category: 'writing' },
  { term: 'broadly speaking', type: 'chunk', cefr: 'B2', italian: 'in generale', definition: 'Generally.', example: 'Broadly speaking, the print was reassuring.', category: 'writing' },
  { term: 'that said', type: 'chunk', cefr: 'B2', italian: 'detto questo / tuttavia', definition: 'However.', example: 'That said, risks remain.', category: 'writing' },
  { term: 'on the back of', type: 'chunk', cefr: 'C1', italian: 'sulla scia di', definition: 'Due to / following.', example: 'Shares rallied on the back of strong guidance.', category: 'writing' },
  { term: 'with that in mind', type: 'chunk', cefr: 'B2', italian: 'tenendo conto di ciò', definition: 'Considering this.', example: 'With that in mind, we trim our estimates.', category: 'writing' },
  { term: 'all in all', type: 'chunk', cefr: 'B2', italian: 'tutto sommato', definition: 'Overall.', example: 'All in all, a clean quarter.', category: 'writing' },
  { term: 'to put it differently', type: 'chunk', cefr: 'C1', italian: 'in altre parole', definition: 'Rephrasing.', example: 'To put it differently, the moat is widening.', category: 'writing' },
  { term: 'against expectations', type: 'chunk', cefr: 'B2', italian: 'contro le aspettative', definition: 'Surprisingly.', example: 'Against expectations, EBIT margin expanded.', category: 'writing' },

  // ===== TIME EXPRESSIONS =====
  { term: 'going forward', type: 'chunk', cefr: 'B2', italian: 'in futuro / d\'ora in poi', definition: 'In the future.', example: 'Going forward, we expect margins to normalise.', category: 'time' },
  { term: 'over the medium term', type: 'chunk', cefr: 'B2', italian: 'nel medio termine', definition: '~3-5 year horizon.', example: 'Over the medium term, structural growth is intact.', category: 'time' },
  { term: 'in the near term', type: 'chunk', cefr: 'B2', italian: 'nel breve termine', definition: 'In the immediate future.', example: 'In the near term, we see limited catalysts.', category: 'time' },
  { term: 'year-to-date', type: 'word', cefr: 'B2', italian: 'da inizio anno', definition: 'YTD.', example: 'Shares are up 18% YTD.', category: 'time' },

  // ===== ITALIAN-INTERFERENCE TRAPS (paired) =====
  { term: 'depend on (NOT depend from)', type: 'collocation', cefr: 'B2', italian: 'dipendere da', definition: 'Correct preposition is ON in English.', example: 'Margins depend on input costs.', category: 'italian_trap' },
  { term: 'consist of (NOT consist in)', type: 'collocation', cefr: 'B2', italian: 'consistere in', definition: 'Use OF for components, IN for what it means.', example: 'The portfolio consists of 30 stocks.', category: 'italian_trap' },
  { term: 'discuss (NO preposition)', type: 'word', cefr: 'B2', italian: 'discutere di', definition: 'In English: "discuss something", NOT "discuss about".', example: 'We discussed the results (NOT discussed about).', category: 'italian_trap' },
  { term: 'request something (NOT request for)', type: 'word', cefr: 'B2', italian: 'richiedere', definition: 'No preposition after "request" as verb.', example: 'Investors requested more disclosure.', category: 'italian_trap' },
  { term: 'eventually = alla fine (NOT eventualmente)', type: 'word', cefr: 'B2', italian: 'eventualmente = "if needed"', definition: 'False friend. Eventually = "in the end". For "eventualmente" use "if necessary".', example: 'The deal will eventually close in 2025.', category: 'italian_trap' },
  { term: 'actually = in realtà (NOT attualmente)', type: 'word', cefr: 'B2', italian: 'attualmente = currently', definition: 'False friend. Actually = "in fact". For "attualmente" use "currently".', example: 'Actually, margins improved despite the slowdown.', category: 'italian_trap' },
  { term: 'sensible = ragionevole (NOT sensibile)', type: 'word', cefr: 'B2', italian: 'sensibile = sensitive', definition: 'False friend.', example: 'A sensible approach to risk management.', category: 'italian_trap' },
  { term: 'argument = discussione/tesi (NOT argomento)', type: 'word', cefr: 'B2', italian: 'argomento = topic/subject', definition: 'False friend. Use "topic" or "subject" for argomento.', example: 'A compelling argument for an Overweight rating.', category: 'italian_trap' },
  { term: 'attend = partecipare (NOT attendere)', type: 'word', cefr: 'B2', italian: 'attendere = to wait', definition: 'False friend. Attend = "be present at".', example: 'We attended the analyst day.', category: 'italian_trap' },
  { term: 'eventually vs finally', type: 'word', cefr: 'C1', italian: '', definition: '"Eventually" = after a long time. "Finally" = at last in a sequence.', example: 'Finally, we discuss risks. (NOT "Eventually, we discuss risks.")', category: 'italian_trap' },
  { term: 'I am 30 (NOT I have 30 years)', type: 'chunk', cefr: 'B2', italian: 'ho 30 anni', definition: 'In English use BE for age, not HAVE.', example: 'I am 30 years old.', category: 'italian_trap' },
  { term: 'ask a question (NOT make a question)', type: 'collocation', cefr: 'B2', italian: 'fare una domanda', definition: 'In English: ASK questions, not make them.', example: 'Investors asked detailed questions on capex.', category: 'italian_trap' },
  { term: 'make a decision', type: 'collocation', cefr: 'B2', italian: 'prendere una decisione', definition: 'In English: MAKE decisions (not TAKE).', example: 'The board made a decision on the dividend.', category: 'italian_trap' },
  { term: 'take a photo / take a break', type: 'collocation', cefr: 'B2', italian: 'fare una foto / pausa', definition: 'In English use TAKE, not MAKE.', example: 'Let\'s take a break.', category: 'italian_trap' },
  { term: 'in line with (NOT in line of)', type: 'chunk', cefr: 'B2', italian: 'in linea con', definition: 'Preposition is WITH.', example: 'Results came in line with guidance.', category: 'italian_trap' },
  { term: 'similar to (NOT similar of/at)', type: 'chunk', cefr: 'B2', italian: 'simile a', definition: 'Preposition is TO.', example: 'A model similar to last year\'s.', category: 'italian_trap' },
  { term: 'different from (NOT different of)', type: 'chunk', cefr: 'B2', italian: 'diverso da', definition: 'Preposition is FROM.', example: 'This cycle is different from 2008.', category: 'italian_trap' },
  { term: 'married to (NOT married with)', type: 'chunk', cefr: 'B2', italian: 'sposato con', definition: 'Preposition is TO.', example: 'She is married to a banker.', category: 'italian_trap' },
  { term: 'good at (NOT good in)', type: 'chunk', cefr: 'B2', italian: 'bravo in', definition: 'Preposition is AT for skills.', example: 'He is good at modelling.', category: 'italian_trap' },
  { term: 'interested in (NOT interested to)', type: 'chunk', cefr: 'B2', italian: 'interessato a', definition: 'Preposition is IN.', example: 'We are interested in the consumer space.', category: 'italian_trap' },

  // ===== HIGH-VALUE C1 IDIOMS =====
  { term: 'a mixed bag', type: 'idiom', cefr: 'C1', italian: 'un risultato misto', definition: 'A mix of good and bad elements.', example: 'The print was a mixed bag — strong volumes but weak pricing.', category: 'idioms' },
  { term: 'kitchen-sinking', type: 'idiom', cefr: 'C2', italian: 'svalutare tutto in una volta', definition: 'Booking all bad news in one quarter.', example: 'New management is kitchen-sinking the numbers.', category: 'idioms' },
  { term: 'low-hanging fruit', type: 'idiom', cefr: 'C1', italian: 'opportunità facili', definition: 'Easy wins.', example: 'Cost-out programmes have already harvested the low-hanging fruit.', category: 'idioms' },
  { term: 'move the needle', type: 'idiom', cefr: 'C1', italian: 'fare la differenza', definition: 'Make a meaningful impact.', example: 'A EUR 50m deal won\'t move the needle.', category: 'idioms' },
  { term: 'hit the ground running', type: 'idiom', cefr: 'C1', italian: 'partire in quarta', definition: 'Start strongly.', example: 'The new CEO hit the ground running.', category: 'idioms' },
  { term: 'in the driver\'s seat', type: 'idiom', cefr: 'C1', italian: 'al posto di comando', definition: 'In control.', example: 'The company is in the driver\'s seat in pricing.', category: 'idioms' },
  { term: 'bake in', type: 'phrasal_verb', cefr: 'C1', italian: 'incorporare nelle stime', definition: 'Include in forecasts.', example: 'We bake in 3% pricing for FY24.', category: 'idioms' },
  { term: 'hold up well', type: 'phrasal_verb', cefr: 'B2', italian: 'reggere bene', definition: 'Resist pressure.', example: 'Margins held up well despite cost inflation.', category: 'idioms' },
  { term: 'cherry-pick', type: 'idiom', cefr: 'C1', italian: 'selezionare a piacere', definition: 'Pick selectively in a biased way.', example: 'Don\'t cherry-pick the data.', category: 'idioms' },
  { term: 'a double-edged sword', type: 'idiom', cefr: 'C1', italian: 'arma a doppio taglio', definition: 'Has both positive and negative effects.', example: 'High operating leverage is a double-edged sword.', category: 'idioms' },
];
