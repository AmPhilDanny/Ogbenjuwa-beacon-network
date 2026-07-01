const CACHE_VERSION = 'v1';
const STATIC_CACHE = `ogbenjuwa-static-${CACHE_VERSION}`;
const API_CACHE = `ogbenjuwa-api-${CACHE_VERSION}`;
const ASSET_CACHE = `ogbenjuwa-assets-${CACHE_VERSION}`;

const STATIC_URLS = ['/', '/index.html', '/manifest.json', '/offline.html', '/ogbenjuwa-icon.svg'];
const API_BASE = '/api/v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_URLS).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('ogbenjuwa-') && k !== STATIC_CACHE && k !== API_CACHE && k !== ASSET_CACHE)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  if (url.pathname.startsWith(API_BASE)) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstWithNetworkFallback(request, ASSET_CACHE));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithCache(request, STATIC_CACHE));
    return;
  }
  event.respondWith(fetch(request).catch(() => new Response('Offline', { status: 503 })));
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'ogbenjuwa-sync') {
    event.waitUntil(processOfflineQueue());
  }
});

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(cacheName).then((cache) => cache.put(request, clone));
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

async function processOfflineQueue() {
  try {
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({ type: 'PROCESS_QUEUE' });
    }
  } catch {}
}

self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || 'Ogbenjuwa Alert';
    event.waitUntil(
      self.registration.showNotification(title, {
        body: data.body || '',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.tag || 'default',
        data: data.url ? { url: data.url } : {},
      }),
    );
  } catch {}
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
