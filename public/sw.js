const CACHE_NAME = "premarket-cache-v1";
const STATIC_CACHE = "premarket-static-v1";
const DYNAMIC_CACHE = "premarket-dynamic-v1";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/favicon.ico",
  "/manifest.json",
  "/og-image.png",
  "/api/prices/cached",
];

// External CDN domains to cache
const CDN_DOMAINS = [
  "logo.clearbit.com",
  "ui-avatars.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (url.pathname.startsWith("/") || STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle CDN requests
  if (CDN_DOMAINS.some((domain) => url.hostname.includes(domain))) {
    event.respondWith(handleCdnRequest(request));
    return;
  }
});

// Handle API requests with cache-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first for API requests
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for API requests
    return new Response(
      JSON.stringify({ error: "Offline - No cached data available" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/");
    }

    throw error;
  }
}

// Handle CDN requests with stale-while-revalidate strategy
async function handleCdnRequest(request) {
  const cachedResponse = await caches.match(request);

  // Return cached response immediately if available
  if (cachedResponse) {
    // Update cache in background
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, response);
          });
        }
      })
      .catch(() => {
        // Ignore background fetch errors
      });

    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return placeholder for failed CDN requests
    if (request.url.includes("logo.clearbit.com")) {
      return new Response(
        `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" fill="#f3f4f6"/>
          <text x="16" y="20" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">?</text>
        </svg>`,
        {
          headers: { "Content-Type": "image/svg+xml" },
        }
      );
    }

    throw error;
  }
}

// Background sync for offline data
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending data when connection is restored
    const response = await fetch("/api/prices/cached?refresh=true");
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put("/api/prices/cached", response.clone());
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Push notifications (if needed in the future)
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New market data available",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(
    self.registration.showNotification("PreMarketPrice", options)
  );
});
