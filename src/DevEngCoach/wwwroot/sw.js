const CACHE_NAME = 'deveng-cache-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/fundamentals.html',
  '/styles.css',
  '/app.js',
  '/deveng-components.js',
  '/deveng-command-palette.js',
  '/deveng-kinematic-tract.js',
  '/deveng-slow-audio.js',
  '/deveng-self-check.js',
  '/deveng-one-tap-start.js',
  '/deveng-audio-only.js',
  '/manifest.json'
];

// Install: Precache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (err) {
        console.warn('[SW] Bulk precache failed, falling back to resilient individual caching:', err);
        await Promise.allSettled(
          PRECACHE_ASSETS.map((asset) =>
            cache.add(asset).catch((itemErr) =>
              console.warn('[SW] Could not precache individual asset:', asset, itemErr)
            )
          )
        );
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Static assets (Cache-first) & API (Network-first with offline fallback)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Strategy for APIs (/api/*): Network-first with cache fallback or structured offline JSON
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Strategy for static assets (.css, .js, .html, images, fonts, root)
  const isStatic =
    request.mode === 'navigate' ||
    url.pathname === '/' ||
    /\.(css|js|html|json|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i.test(url.pathname);

  if (isStatic) {
    event.respondWith(handleStaticAssetRequest(request));
    return;
  }

  // Default same-origin fallback
  if (url.origin === self.location.origin) {
    event.respondWith(handleStaticAssetRequest(request));
  }
});

/**
 * Handle API requests: Network-first -> Cache fallback -> Structured offline JSON
 */
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] API network request failed, falling back to cache:', request.url, error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Structured JSON offline fallback
    return new Response(
      JSON.stringify({
        offline: true,
        success: false,
        message: 'Network offline. You are currently working without internet connection.',
        url: request.url,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable (Offline)',
        headers: {
          'Content-Type': 'application/json',
          'X-DevEng-Offline': 'true'
        }
      }
    );
  }
}

/**
 * Handle static assets: Cache-first -> Network fallback -> HTML fallback
 */
async function handleStaticAssetRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Static asset network fetch failed:', request.url, error);

    // If navigation fails while offline, fallback to cached index.html
    if (request.mode === 'navigate') {
      const fallback = (await caches.match('/index.html')) || (await caches.match('/'));
      if (fallback) {
        return fallback;
      }
    }

    throw error;
  }
}
