const CACHE_NAME = 'note-ninja-v2';
const STATIC_CACHE_NAME = 'note-ninja-static-v2';

// Assets that can be cached forever (hashed assets)
const STATIC_ASSETS = [
  '/placeholders/city.jpg',
  '/placeholders/strawberry.jpg',
  '/placeholders/dog.jpg',
  '/placeholders/cool.jpg',
  '/placeholders/car.jpg',
  '/goose-radio.png'
];

// Helper function to determine if URL is a hashed asset
function isHashedAsset(url) {
  return url.pathname.includes('/assets/') && /-[a-f0-9]{8,}\./.test(url.pathname);
}

// Helper function to determine if URL is HTML
function isHtmlRequest(request) {
  return request.headers.get('accept')?.includes('text/html') || 
         request.url.endsWith('.html') || 
         (request.mode === 'navigate');
}

// Install event - cache static resources only
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Opened static cache');
        return cache.addAll(STATIC_ASSETS);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Fetch event - implement cache-first for static assets, network-first for HTML
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Never cache HTML files - always fetch from network
  if (isHtmlRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Fallback to a basic offline page if available
          return caches.match('/offline.html') || new Response('Offline', { status: 503 });
        })
    );
    return;
  }
  
  // Cache-first strategy for hashed assets (they never change)
  if (isHashedAsset(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(networkResponse => {
            // Cache the response for future use
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }
  
  // For other static assets (images, etc.), use cache-first with fallback
  if (url.pathname.startsWith('/placeholders/') || url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(networkResponse => {
          return caches.open(STATIC_CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }
  
  // For everything else, just fetch from network
  event.respondWith(fetch(event.request));
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});