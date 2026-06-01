const CACHE_NAME = 'trek-mapper-v18-media';
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
        console.log('[PekerjaServis] Cache dibuka v18');
        return cache.addAll(urlsToCache).catch(err => console.warn('[PekerjaServis] Amaran cache:', err));
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
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
  
  if (event.request.url.includes('script.google.com') || 
      event.request.url.includes('script.googleusercontent.com') || 
      event.request.url.includes('api.qrserver.com') ||
      event.request.url.includes('drive.google.com')) {
    return;
  }

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
