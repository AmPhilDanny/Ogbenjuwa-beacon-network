// ─── Ogbenjuwa Service Worker ────────────────────────────────────────────
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `ogbenjuwa-static-${CACHE_VERSION}`;
const API_CACHE = `ogbenjuwa-api-${CACHE_VERSION}`;
const ASSET_CACHE = `ogbenjuwa-assets-${CACHE_VERSION}`;

const STATIC_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/ogbenjuwa-icon.svg',
];

const API_BASE = '/api/v1';

// ─── Install: pre-cache critical assets ───────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_URLS).catch(() => {
        // Pre-cache is advisory — proceed even if some fail
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate: clean old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((k) => k.startsWith('ogbenjuwa-') && k !== STATIC_CACHE && k !== API_CACHE && k !== ASSET_CACHE)
          .map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch: routing strategy ──────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and browser extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // API calls: network-first with cache fallback (stale-while-revalidate)
  if (url.pathname.startsWith(API_BASE)) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // Static assets (JS, CSS, images, fonts): cache-first
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstWithNetworkFallback(request, ASSET_CACHE));
    return;
  }

  // Navigation / HTML: network-first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithCache(request, STATIC_CACHE));
    return;
  }

  // Everything else: network-only
  event.respondWith(fetch(request).catch(() => new Response('Offline', { status: 503 })));
});

// ─── Background Sync ──────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'ogbenjuwa-sync') {
    event.waitUntil(processOfflineQueue());
  }
});

// ─── Caching Strategies ───────────────────────────────────────────────────

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(cacheName).then((cache) => {
        cache.put(request, clone);
      });
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({ offline: true, cached: false }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // For navigation, serve the offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    return caches.match('/');
  }
}

async function cacheFirstWithNetworkFallback(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(cacheName).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch {
    return new Response('', { status: 404 });
  }
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  const ext = url.pathname.split('.').pop()?.toLowerCase();
  return ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot'].includes(ext || '');
}

// ─── Offline Queue Processing ─────────────────────────────────────────────

async function processOfflineQueue() {
  try {
    // Read from IndexedDB via a dedicated client page message
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({ type: 'PROCESS_QUEUE' });
    }
  } catch (e) {
    console.error('SW: queue processing failed', e);
  }
}

// ─── Push Notifications (placeholder) ─────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || 'Ogbenjuwa Alert';
    const options = {
      body: data.body || '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'default',
      data: data.url ? { url: data.url } : {},
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    // Ignore malformed push payloads
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
