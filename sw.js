// Pekerja Servis (Service Worker) - SMART EVENT MAP
// Versi ini membaiki isu cache yang boleh menyebabkan Leaflet gagal dimuatkan (L is not defined)
// apabila satu/lebih fail CDN gagal semasa install.

const CACHE_VERSION = 'v46';
const CACHE_NAME = `smart-event-map-${CACHE_VERSION}`;
const TILE_CACHE = `smart-event-tiles-${CACHE_VERSION}`;

// Aset teras (wajib ada untuk app hidup)
const CORE_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json'
];

// Aset tempatan tambahan (tidak wajib). Jika tiada, install masih berjaya.
const OPTIONAL_LOCAL_ASSETS = [
  './app.obf.js'
];

// Aset CDN (nice-to-have). Jangan biar install gagal hanya sebab 1 URL CDN bermasalah.
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com/3.4.17',
  'https://cdn.jsdelivr.net/npm/lucide@0.263.0/dist/umd/lucide.min.js',

  // Leaflet (utama ikut index.html: jsDelivr; simpan juga unpkg sebagai fallback cache)
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',

  'https://unpkg.com/@geoman-io/leaflet-geoman-free@2.14.2/dist/leaflet-geoman.css',
  'https://unpkg.com/@geoman-io/leaflet-geoman-free@2.14.2/dist/leaflet-geoman.min.js',
  'https://unpkg.com/leaflet-polylineoffset@1.1.1/leaflet-polylineoffset.js',

  // Nota: Google Fonts CSS akan load font dari fonts.gstatic.com.
  // Kita cache CSS ini sahaja; jika offline sepenuhnya, font mungkin fallback ke default.
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // 1) Cache aset teras (kalau ini gagal, install patut gagal).
    await cache.addAll(CORE_ASSETS);

    // 2) Cuba cache CDN satu-per-satu (kalau ada yang gagal, yang lain masih masuk).
    await Promise.allSettled(
      CDN_ASSETS.map((url) => cache.add(url))
    );

    // 3) Cuba cache aset tempatan tambahan (tak wajib)
    await Promise.allSettled(
      OPTIONAL_LOCAL_ASSETS.map((url) => cache.add(url))
    );
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map((key) => {
        const isAppCache = key.startsWith('smart-event-map-');
        const isTileCache = key.startsWith('smart-event-tiles-');
        if ((isAppCache || isTileCache) && key !== CACHE_NAME && key !== TILE_CACHE) {
          return caches.delete(key);
        }
      })
    );
    await self.clients.claim();
  })());
});

function shouldBypass(requestUrl) {
  // Elak cache untuk endpoint dinamik / sensitif / third-party API tertentu
  return (
    requestUrl.hostname.includes('script.google.com') ||
    requestUrl.hostname.includes('script.googleusercontent.com') ||
    requestUrl.hostname.includes('api.qrserver.com') ||
    requestUrl.hostname.includes('drive.google.com') ||
    requestUrl.hostname.includes('rainviewer.com')
  );
}

function isTileRequest(requestUrl) {
  const tileDomains = [
    'opentopomap.org',
    'openstreetmap.org',
    'arcgisonline.com',
    'mt1.google.com',
    'waymarkedtrails.org'
  ];
  return tileDomains.some((domain) => requestUrl.hostname.includes(domain));
}

function isCdnRequest(requestUrl) {
  const cdnDomains = [
    'unpkg.com',
    'cdn.jsdelivr.net',
    'cdn.tailwindcss.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ];
  return cdnDomains.some((domain) => requestUrl.hostname.includes(domain));
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (shouldBypass(url)) return;

  // Tiles: cache-first (jimat data, laju).
  if (isTileRequest(url)) {
    event.respondWith((async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      try {
        const res = await fetch(event.request);
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const tileCache = await caches.open(TILE_CACHE);
          tileCache.put(event.request, res.clone());
        }
        return res;
      } catch (e) {
        return cached; // mungkin undefined, tapi sekurang-kurangnya tak throw
      }
    })());
    return;
  }

  // CDN: cache-first supaya offline masih boleh jalan (dan elak L undefined).
  if (isCdnRequest(url)) {
    event.respondWith((async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      const res = await fetch(event.request);
      if (res && (res.status === 200 || res.type === 'opaque')) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, res.clone());
      }
      return res;
    })());
    return;
  }

  // Fail lain: network-first, fallback cache.
  event.respondWith((async () => {
    try {
      const res = await fetch(event.request);
      if (res && (res.status === 200 || res.type === 'opaque')) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, res.clone());
      }
      return res;
    } catch (e) {
      return caches.match(event.request);
    }
  })());
});
