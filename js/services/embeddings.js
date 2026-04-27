/**
 * embeddings.js — RAG layer for the corpus.
 * Stores embedded chunks in IndexedDB and retrieves nearest neighbors via cosine.
 *
 * For personal use with hundreds of chunks this is plenty fast (~10ms per query).
 * For thousands of chunks, consider switching to ANN (e.g. hnswlib-wasm).
 */
(function () {
  /**
   * Split a long text into ~500-token chunks, paragraph-aware.
   */
  function chunkText(text, maxChars = 1500) {
    if (!text) return [];
    const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const chunks = [];
    let current = '';
    for (const p of paragraphs) {
      if ((current + '\n\n' + p).length > maxChars && current.length > 0) {
        chunks.push(current);
        current = p;
      } else {
        current = current ? current + '\n\n' + p : p;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  /**
   * Add a document to the corpus: chunk, embed, and store.
   */
  async function ingestDocument({ source, title, text, kind = 'report' }) {
    const chunks = chunkText(text);
    if (chunks.length === 0) return [];
    // Embed in batches of 10 to avoid huge requests
    const ids = [];
    for (let i = 0; i < chunks.length; i += 10) {
      const batch = chunks.slice(i, i + 10);
      const embeddings = await window.Gemini.embed(batch);
      for (let j = 0; j < batch.length; j++) {
        const id = await window.Storage.add('corpus', {
          source, title, kind,
          chunkIndex: i + j,
          text: batch[j],
          embedding: embeddings[j],
          createdAt: new Date().toISOString(),
        });
        ids.push(id);
      }
    }
    return ids;
  }

  /**
   * Find the top-K nearest chunks to a query.
   */
  async function search(query, k = 5) {
    const [qEmb] = await window.Gemini.embed([query]);
    const all = await window.Storage.getAll('corpus');
    if (all.length === 0) return [];
    const scored = all.map((c) => ({
      ...c,
      score: window.Gemini.cosine(qEmb, c.embedding || []),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }

  /**
   * Strip embeddings from chunks before showing in UI (smaller payloads).
   */
  function stripEmbeddings(chunks) {
    return chunks.map(({ embedding, ...rest }) => rest);
  }

  window.RAG = { chunkText, ingestDocument, search, stripEmbeddings };
})();
