/**
 * Service Worker for Retro Pong PWA
 * Provides offline support by caching core assets
 */

const CACHE_NAME = 'retro-pong-v1';
const MAX_CACHE_SIZE = 50; // Maximum number of cached items
const ASSETS_TO_CACHE = [
  'index.html',
  'css/main.css',
  'js/config.js',
  'js/utils.js',
  'js/controls.js',
  'js/controls-mobile.js',
  'js/ai.js',
  'js/renderer.js',
  'js/game.js'
];

/**
 * Limit cache size by removing oldest entries
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxSize);
  }
}

/**
 * Install event - cache core assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || !response.ok) {
              return response;
            }
            
            // Clone the response as it can only be consumed once
            const responseToCache = response.clone();
            
            // Cache dynamically fetched assets with size limit
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
                // Limit cache size
                return limitCacheSize(CACHE_NAME, MAX_CACHE_SIZE);
              });
            
            return response;
          })
          .catch((error) => {
            // Network request failed, could return offline page
            throw error;
          });
      })
  );
});
