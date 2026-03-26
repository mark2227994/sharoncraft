const CACHE_VERSION = "sharoncraft-v6-client-pages";
const CORE_ASSETS = [
  "index.html",
  "about.html",
  "custom-orders.html",
  "delivery-returns.html",
  "new-in.html",
  "gift-guide.html",
  "faq.html",
  "contact.html",
  "style.css",
  "script.js",
  "products-data.js",
  "currency-config.js",
  "site.webmanifest",
  "favicon-visible-32x32.png",
  "favicon-visible.ico",
  "android-chrome-visible-192x192.png",
  "android-chrome-visible-512x512.png",
  "offline.html",
];
const NETWORK_FIRST_PATHS = new Set([
  "/",
  "/index.html",
  "/products-data.js",
  "/script.js",
  "/style.css",
  "/currency-config.js",
]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const useNetworkFirst =
    isSameOrigin && (event.request.mode === "navigate" || NETWORK_FIRST_PATHS.has(requestUrl.pathname));

  if (useNetworkFirst) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) {
            return cached;
          }
          if (event.request.mode === "navigate") {
            return caches.match("offline.html");
          }
          return caches.match("offline.html");
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("offline.html");
          }
          return caches.match("offline.html");
        });
    }),
  );
});
