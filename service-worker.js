// A minimal service worker to enable PWA installation.

self.addEventListener('install', (event) => {
  // Immediately activate the new service worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all clients as soon as the service worker is activated.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // For now, we're just passing through fetch requests.
  // This can be extended later for caching strategies.
  event.respondWith(fetch(event.request));
});
