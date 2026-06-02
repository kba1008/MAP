const CACHE_NAME = 'trek-mapper-v32-live';
const TILE_CACHE = 'trek-mapper-tiles';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com/3.4.17',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/lucide@0.263.0/dist/umd/lucide.min.js',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap',
  'https://unpkg.com/@geoman-io/leaflet-geoman-free@2.14.2/dist/leaflet-geoman.css',
  'https://unpkg.com/@geoman-io/leaflet-geoman-free@2.14.2/dist/leaflet-geoman.min.js',
  'https://unpkg.com/leaflet-polylineoffset@1.1.1/leaflet-polylineoffset.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[PekerjaServis] Cache dibuka v32');
        return cache.addAll(urlsToCache).catch(err => console.warn('[PekerjaServis] Amaran cache:', err));
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, TILE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Bypass GAS and dynamic APIs
  if (url.hostname.includes('script.google.com') || 
      url.hostname.includes('script.googleusercontent.com') || 
      url.hostname.includes('api.qrserver.com') ||
      url.hostname.includes('drive.google.com')) {
    return;
  }

  // Tile Caching Strategy (Cache First for offline maps)
  const tileDomains = ['opentopomap.org', 'openstreetmap.org', 'arcgisonline.com', 'mt1.google.com'];
  const isTileRequest = tileDomains.some(domain => url.hostname.includes(domain));

  if (isTileRequest) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;
          const responseToCache = networkResponse.clone();
          caches.open(TILE_CACHE).then((cache) => cache.put(event.request, responseToCache));
          return networkResponse;
        }).catch(() => {
          // Failed to fetch tile and not in cache, silently fail (Leaflet handles missing tiles)
        });
      })
    );
    return;
  }

  // Default Stale-While-Revalidate / Cache-First for other assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
