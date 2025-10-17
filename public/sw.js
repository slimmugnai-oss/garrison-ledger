// Garrison Ledger Service Worker
// Provides offline support and caching for military users in deployment zones

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `garrison-ledger-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/library',
  '/dashboard/tools',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Cache strategies for different request types
const CACHE_STRATEGIES = {
  // Cache first, fall back to network (for static assets)
  CACHE_FIRST: 'cache-first',
  // Network first, fall back to cache (for dynamic content)
  NETWORK_FIRST: 'network-first',
  // Network only (for user-specific data)
  NETWORK_ONLY: 'network-only',
  // Cache only (for offline fallback)
  CACHE_ONLY: 'cache-only'
};

// Install event - pre-cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim(); // Take control of all pages
      })
  );
});

// Fetch event - handle requests based on strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Determine cache strategy based on request
  const strategy = getCacheStrategy(url, request);

  event.respondWith(
    handleRequest(request, strategy)
      .catch((error) => {
        console.error('[SW] Fetch error:', error);
        return getOfflineFallback(url);
      })
  );
});

// Determine the appropriate cache strategy
function getCacheStrategy(url, request) {
  // API calls - Network first (fresh data preferred)
  if (url.pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // Static assets - Cache first (performance)
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }

  // Content blocks - Network first (but cache for offline)
  if (url.pathname.startsWith('/dashboard/library')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // Calculators - Network first (dynamic inputs)
  if (url.pathname.startsWith('/dashboard/tools')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // Default - Network first
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Handle request based on strategy
async function handleRequest(request, strategy) {
  const cache = await caches.open(CACHE_NAME);

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return await cacheFirst(request, cache);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return await networkFirst(request, cache);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return await fetch(request);
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return await cacheOnly(request, cache);
    
    default:
      return await networkFirst(request, cache);
  }
}

// Cache first strategy
async function cacheFirst(request, cache) {
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('[SW] Cache hit:', request.url);
    // Update cache in background
    fetch(request).then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
    }).catch(() => {
      // Ignore network errors
    });
    return cachedResponse;
  }

  console.log('[SW] Cache miss, fetching:', request.url);
  const response = await fetch(request);
  
  if (response && response.status === 200) {
    cache.put(request, response.clone());
  }
  
  return response;
}

// Network first strategy
async function networkFirst(request, cache) {
  try {
    console.log('[SW] Fetching from network:', request.url);
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      // Cache successful responses
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Cache only strategy
async function cacheOnly(request, cache) {
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  throw new Error('Not in cache');
}

// Offline fallback page
async function getOfflineFallback(url) {
  // Try to return cached version of requested page
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(url);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  // Return generic offline page
  return new Response(
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Garrison Ledger</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 20px;
        }
        .offline-container {
          max-width: 500px;
        }
        h1 {
          font-size: 3rem;
          margin: 0 0 1rem;
        }
        p {
          font-size: 1.25rem;
          line-height: 1.6;
          margin: 0 0 2rem;
        }
        button {
          background: white;
          color: #667eea;
          border: none;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        button:hover {
          transform: scale(1.05);
        }
        .icon {
          font-size: 5rem;
          margin-bottom: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="icon">📡</div>
        <h1>You're Offline</h1>
        <p>
          No internet connection detected. Some features may be limited, 
          but you can still access cached content.
        </p>
        <button onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>
    `,
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/html'
      })
    }
  );
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-bookmarks') {
    event.waitUntil(syncBookmarks());
  }
  
  if (event.tag === 'sync-ratings') {
    event.waitUntil(syncRatings());
  }
  
  if (event.tag === 'sync-interactions') {
    event.waitUntil(syncInteractions());
  }
});

// Sync offline bookmarks
async function syncBookmarks() {
  // Get pending bookmarks from IndexedDB
  // Send to server
  console.log('[SW] Syncing bookmarks...');
}

// Sync offline ratings
async function syncRatings() {
  console.log('[SW] Syncing ratings...');
}

// Sync offline interactions
async function syncInteractions() {
  console.log('[SW] Syncing interactions...');
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Garrison Ledger';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.url || '/dashboard'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data || '/dashboard')
  );
});

// Message handler for cache control
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME)
        .then(() => caches.open(CACHE_NAME))
    );
  }
});

console.log('[SW] Service worker script loaded');

