/* ============================================================
   Trek Map Service Worker — sw.js
   Phidim → Charrate | erganesh.com.np
   Offline-first caching for Leaflet tiles, GeoJSON, and UI
   ============================================================ */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `trek-map-static-${CACHE_VERSION}`;
const TILE_CACHE = `trek-map-tiles-${CACHE_VERSION}`;

// Core assets required for 100% offline functionality
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './route.geojson',
  './places.json',
  '/map/',
  '/map/index.html',
  '/map/style.css',
  '/map/app.js',
  '/map/manifest.json',
  '/map/route.geojson',
  '/map/places.json',
  './images/places/ganesh-varieties_1.webp',
  './images/places/ganesh-varieties_2.webp',
  './images/places/ganesh-varieties.webp',
  '/map/images/places/ganesh-varieties.webp',
  './images/places/charrate-yak-lodge.webp',
  './images/places/charrate-yak-lodge_1.webp',
  './images/places/charrate-yak-lodge_2.webp',
  './images/places/charrate-yak-lodge_3.webp',
  '/map/images/places/charrate-yak-lodge.webp',
  './images/silam-sakma-qr.png',
  './images/silam-sakma-qr.svg',
  '/map/images/silam-sakma-qr.png',
  '/map/images/silam-sakma-qr.svg',
  './images/direct-route-qr.png',
  '/map/images/direct-route-qr.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  'https://unpkg.com/localforage@1.10.0/dist/localforage.min.js'
];

// ---- INSTALL: Pre-cache app shell & essential assets ----
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async cache => {
      // Use allSettled so single asset failure does not abort install
      const promises = STATIC_ASSETS.map(url =>
        cache.add(url).catch(err => {
          console.warn('[SW] Cache add skipped for:', url, err.message);
        })
      );
      await Promise.allSettled(promises);
    }).then(() => self.skipWaiting())
  );
});

// ---- ACTIVATE: Purge stale caches from older versions ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== TILE_CACHE)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ---- FETCH: Robust offline routing strategies ----
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Map Tiles: Cache-First (essential for offline trek)
  if (isTileRequest(url)) {
    event.respondWith(
      caches.open(TILE_CACHE).then(async cache => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const networkRes = await fetch(request, { mode: 'cors' });
          if (networkRes && networkRes.ok) {
            cache.put(request, networkRes.clone());
          }
          return networkRes;
        } catch (err) {
          // Offline and tile not cached: return transparent empty 200 SVG or empty response
          return new Response('', { status: 404, statusText: 'Tile not cached offline' });
        }
      })
    );
    return;
  }

  // 2. Data & Media (route.geojson, places.json, shop photos): Cache-first with network fallback
  if (isDataOrMedia(url)) {
    event.respondWith(
      caches.match(request).then(async cached => {
        if (cached) return cached;
        try {
          const networkRes = await fetch(request);
          if (networkRes && networkRes.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkRes.clone());
          }
          return networkRes;
        } catch (err) {
          if (url.pathname.endsWith('.json') || url.pathname.endsWith('.geojson')) {
            return new Response('{"error":"offline","cached":false}', {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          return new Response('', { status: 404 });
        }
      })
    );
    return;
  }

  // 3. App Shell (HTML, CSS, JS, Fonts, CDN libraries): Cache-first
  if (isAppShell(url)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(networkRes => {
          if (networkRes && networkRes.ok) {
            caches.open(STATIC_CACHE).then(c => c.put(request, networkRes.clone()));
          }
          return networkRes;
        }).catch(() => {
          // If HTML navigation fails, return cached index.html
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', { status: 503 });
        });
      })
    );
    return;
  }

  // 4. Default: Network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Helper filters
function isTileRequest(url) {
  return (
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('opentopomap.org') ||
    url.hostname.includes('arcgisonline.com')
  );
}

function isDataOrMedia(url) {
  const p = url.pathname.toLowerCase();
  return (
    p.endsWith('.geojson') ||
    p.endsWith('.json') ||
    p.endsWith('.webp') ||
    p.endsWith('.png') ||
    p.endsWith('.jpg') ||
    p.endsWith('.jpeg') ||
    p.endsWith('.svg')
  );
}

function isAppShell(url) {
  const p = url.pathname.toLowerCase();
  return (
    url.hostname.includes('unpkg.com') ||
    p.endsWith('.html') ||
    p.endsWith('.css') ||
    p.endsWith('.js') ||
    url.pathname.endsWith('/map/') ||
    url.pathname.endsWith('/map')
  );
}
