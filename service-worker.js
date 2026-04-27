/**
 * service-worker.js — minimal offline cache for PWA.
 * Caches app shell so the app loads even without network.
 * API calls (Gemini, LanguageTool) still require network.
 */
const CACHE = 'english-coach-v1';
const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache API calls
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('languagetool.org')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
