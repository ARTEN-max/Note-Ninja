const CACHE_NAME = 'note-ninja-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Temporarily disable service worker to prevent caching issues
self.addEventListener('install', (event) => {
  // Skip installation for now
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Always fetch from network, don't use cache
  event.respondWith(fetch(event.request));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 