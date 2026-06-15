// Soilify Labs service worker
const CACHE_NAME = "soilify-v3";
const STATIC_EXTENSIONS = [".js", ".css", ".woff2", ".woff", ".ttf", ".png", ".jpg", ".webp", ".svg", ".ico"];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Clear ALL old caches on activate
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Never cache: API, auth, Supabase, or cross-origin requests
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.hostname.includes("supabase") ||
    url.hostname !== self.location.hostname
  ) {
    return; // pass through to network
  }

  const isStaticAsset = STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))
    || url.pathname.startsWith("/_next/static/");

  if (isStaticAsset) {
    // Cache-first for static assets (JS, CSS, fonts, images)
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        });
      })
    );
  } else {
    // Network-first for HTML pages — always get fresh content
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
  }
});
