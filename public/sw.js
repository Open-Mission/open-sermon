const CACHE_NAME = "open-sermon-v7";
const OFFLINE_URL = "/offline";
const HOME_URL = "/";

const STATIC_ASSETS = [
  "/offline",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log("[SW] Caching static assets");
      await cache.addAll(STATIC_ASSETS);
      
      console.log("[SW] Pre-caching home page...");
      try {
        const homeResponse = await fetch(HOME_URL, { credentials: "include" });
        if (homeResponse.ok) {
          await cache.put(HOME_URL, homeResponse);
          console.log("[SW] Home page cached");
        }
      } catch {
        console.log("[SW] Could not pre-cache home page");
      }
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => {
          console.log("[SW] Deleting old cache:", name);
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
  console.log("[SW] Activated and claiming clients");
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (url.origin !== location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const pathname = url.pathname;
        
        console.log("[SW] Navigate request for:", pathname);
        
        const cachedResponse = await cache.match(pathname);
        
        if (cachedResponse) {
          console.log("[SW] Serving from cache:", pathname);
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                console.log("[SW] Updating cache for:", pathname);
                cache.put(pathname, networkResponse);
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        console.log("[SW] Not in cache, fetching from network:", pathname);
        
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            console.log("[SW] Caching new page:", pathname);
            cache.put(pathname, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          console.log("[SW] Network failed, checking for cached home...");
          
          const cachedHome = await cache.match(HOME_URL);
          if (cachedHome && pathname !== HOME_URL) {
            console.log("[SW] Redirecting to cached home page");
            return cachedHome;
          }
          
          const offlineResponse = await cache.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
          
          return new Response(
            "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Offline</title></head><body style='display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;background:#1A1B2E;color:#E5E7EB;text-align:center'><h1 style='color:#D4A843'>You're Offline</h1><p>Please check your connection</p><button onclick='location.reload()' style='margin-top:2rem;padding:0.75rem 2rem;background:#D4A843;color:#1A1B2E;border:none;border-radius:0.5rem;font-weight:600;cursor:pointer'>Try Again</button></body></html>",
            { headers: { "Content-Type": "text/html" } }
          );
        }
      })()
    );
    return;
  }

  // Cache First for Images, Network First for Code/Styles/Fonts
  if (
    request.destination === "image" ||
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font"
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        
        // Try network first for everything except images, which can be cache-first
        if (request.destination !== "image") {
          try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          } catch {
            const cachedResponse = await cache.match(request);
            if (cachedResponse) return cachedResponse;
            return new Response("", { status: 408 });
          }
        }

        // Cache first for images
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          return new Response("", { status: 408 });
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) return cachedResponse;
      
      try {
        return await fetch(request);
      } catch {
        return new Response("", { status: 408 });
      }
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
