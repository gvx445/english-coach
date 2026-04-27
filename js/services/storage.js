/**
 * storage.js — IndexedDB wrapper.
 * All user data lives here. Browser-local. No server.
 */
(function () {
  const DB_NAME = 'english-coach';
  const DB_VERSION = 1;
  let _db = null;

  function open() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('documents')) {
          const s = db.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
          s.createIndex('updatedAt', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('errors')) {
          const s = db.createObjectStore('errors', { keyPath: 'id', autoIncrement: true });
          s.createIndex('category', 'category');
          s.createIndex('createdAt', 'createdAt');
        }
        if (!db.objectStoreNames.contains('vocabulary')) {
          const s = db.createObjectStore('vocabulary', { keyPath: 'id', autoIncrement: true });
          s.createIndex('term', 'term', { unique: false });
          s.createIndex('type', 'type');
          s.createIndex('cefr', 'cefr');
        }
        if (!db.objectStoreNames.contains('srs')) {
          const s = db.createObjectStore('srs', { keyPath: 'vocabId' });
          s.createIndex('dueDate', 'dueDate');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('corpus')) {
          const s = db.createObjectStore('corpus', { keyPath: 'id', autoIncrement: true });
          s.createIndex('source', 'source');
        }
        if (!db.objectStoreNames.contains('sessions')) {
          const s = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
          s.createIndex('startedAt', 'startedAt');
        }
      };
      req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  function tx(store, mode = 'readonly') {
    return open().then((db) => db.transaction(store, mode).objectStore(store));
  }

  async function put(storeName, value) {
    const s = await tx(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const r = s.put(value);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  async function add(storeName, value) {
    const s = await tx(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const r = s.add(value);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  async function get(storeName, key) {
    const s = await tx(storeName);
    return new Promise((resolve, reject) => {
      const r = s.get(key);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  async function getAll(storeName, limit = null) {
    const s = await tx(storeName);
    return new Promise((resolve, reject) => {
      const r = s.getAll(undefined, limit || undefined);
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error);
    });
  }
  async function remove(storeName, key) {
    const s = await tx(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const r = s.delete(key);
      r.onsuccess = () => resolve();
      r.onerror = () => reject(r.error);
    });
  }
  async function clear(storeName) {
    const s = await tx(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const r = s.clear();
      r.onsuccess = () => resolve();
      r.onerror = () => reject(r.error);
    });
  }
  async function getByIndex(storeName, indexName, value) {
    const s = await tx(storeName);
    return new Promise((resolve, reject) => {
      const idx = s.index(indexName);
      const r = idx.getAll(value);
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error);
    });
  }

  async function getSetting(key, defaultValue = null) {
    const row = await get('settings', key);
    return row ? row.value : defaultValue;
  }
  async function setSetting(key, value) {
    return put('settings', { key, value });
  }

  async function exportAll() {
    const stores = ['documents', 'errors', 'vocabulary', 'srs', 'settings', 'corpus', 'sessions'];
    const out = { exportedAt: new Date().toISOString(), version: 1 };
    for (const s of stores) out[s] = await getAll(s);
    return out;
  }

  async function importAll(data) {
    if (!data || data.version !== 1) throw new Error('Invalid backup format');
    const stores = ['documents', 'errors', 'vocabulary', 'srs', 'settings', 'corpus', 'sessions'];
    for (const s of stores) {
      if (!Array.isArray(data[s])) continue;
      await clear(s);
      for (const row of data[s]) {
        if (s === 'settings' || s === 'srs') await put(s, row);
        else { const { id, ...rest } = row; await add(s, rest); }
      }
    }
  }

  window.Storage = {
    open, put, add, get, getAll, remove, clear, getByIndex,
    getSetting, setSetting, exportAll, importAll,
  };
})();
