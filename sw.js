// Legacy service worker cleanup file.
// If an old root service worker is still registered in a browser, this
// version clears old caches and unregisters itself so current site updates
// can load directly from the network.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async function cleanupLegacyWorker() {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch (error) {
        // Ignore cache cleanup failures and still try to unregister.
      }

      try {
        const registrations = await self.registration.unregister();
        void registrations;
      } catch (error) {
        // Ignore unregister failures.
      }

      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      await Promise.all(
        clients.map((client) => {
          if (client && typeof client.navigate === "function") {
            return client.navigate(client.url);
          }
          return Promise.resolve();
        })
      );
    }())
  );
});

self.addEventListener("fetch", () => {
  // Intentionally no caching logic.
});
