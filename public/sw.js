// Service Worker for PCS Copilot Offline Capability
// Version: 2.0.0
// Purpose: Enable offline claim editing with background sync

const CACHE_VERSION = "pcs-copilot-v2.0.0";
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_CLAIMS = `${CACHE_VERSION}-claims`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/dashboard/pcs-copilot/enhanced",
  "/offline",
  "/manifest.json",
  "/favicon.ico"
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[PCS Copilot SW] Installing service worker...");
  
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      console.log("[PCS Copilot SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  console.log("[PCS Copilot SW] Activating service worker...");
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_STATIC && cacheName !== CACHE_DYNAMIC && cacheName !== CACHE_CLAIMS) {
            console.log("[PCS Copilot SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome extensions and other schemes
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // API requests - network first with cache fallback
  if (url.pathname.startsWith("/api/pcs/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseClone = response.clone();
          
          // Cache successful responses
          if (response.status === 200) {
            caches.open(CACHE_DYNAMIC).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline response
            return new Response(
              JSON.stringify({
                error: "You're offline",
                offline: true,
                cached: false
              }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" }
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - cache first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2)$/) ||
    STATIC_ASSETS.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          // Cache the response
          const responseClone = response.clone();
          caches.open(CACHE_STATIC).then((cache) => {
            cache.put(request, responseClone);
          });
          
          return response;
        });
      })
    );
    return;
  }

  // HTML pages - network first with cache fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the page
          const responseClone = response.clone();
          caches.open(CACHE_DYNAMIC).then((cache) => {
            cache.put(request, responseClone);
          });
          
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Fallback to offline page
            return caches.match("/offline");
          });
        })
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Background Sync - sync claim data when back online
self.addEventListener("sync", (event) => {
  console.log("[PCS Copilot SW] Background sync triggered:", event.tag);
  
  if (event.tag === "sync-pcs-claim") {
    event.waitUntil(syncClaimData());
  }
});

async function syncClaimData() {
  console.log("[PCS Copilot SW] Syncing claim data...");
  
  try {
    // Get pending claims from IndexedDB
    const pendingClaims = await getPendingClaims();
    
    if (pendingClaims.length === 0) {
      console.log("[PCS Copilot SW] No pending claims to sync");
      return;
    }
    
    // Sync each claim
    for (const claim of pendingClaims) {
      try {
        const response = await fetch("/api/pcs/claim", {
          method: claim.method || "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(claim.data)
        });
        
        if (response.ok) {
          console.log("[PCS Copilot SW] Claim synced successfully:", claim.id);
          await removePendingClaim(claim.id);
          
          // Notify the client
          await notifyClients({
            type: "sync-success",
            claimId: claim.id
          });
        } else {
          console.error("[PCS Copilot SW] Failed to sync claim:", claim.id);
        }
      } catch (error) {
        console.error("[PCS Copilot SW] Error syncing claim:", error);
      }
    }
  } catch (error) {
    console.error("[PCS Copilot SW] Background sync failed:", error);
  }
}

// IndexedDB helpers
async function getPendingClaims() {
  // This would normally use IndexedDB to get pending claims
  // For now, return empty array
  return [];
}

async function removePendingClaim(claimId) {
  // This would normally remove the claim from IndexedDB
  console.log("[PCS Copilot SW] Removed pending claim:", claimId);
}

// Notify all clients
async function notifyClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage(message);
  });
}

// Push notifications for PCS deadlines
self.addEventListener("push", (event) => {
  console.log("[PCS Copilot SW] Push notification received");
  
  const data = event.data?.json() || {};
  const title = data.title || "PCS Copilot Reminder";
  const options = {
    body: data.body || "You have a PCS deadline approaching",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    data: data.url || "/dashboard/pcs-copilot/enhanced",
    actions: [
      {
        action: "open",
        title: "Open Claim"
      },
      {
        action: "dismiss",
        title: "Dismiss"
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[PCS Copilot SW] Notification clicked:", event.action);
  
  event.notification.close();
  
  if (event.action === "open") {
    const urlToOpen = event.notification.data || "/dashboard/pcs-copilot/enhanced";
    
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

console.log("[PCS Copilot SW] Service worker loaded successfully");