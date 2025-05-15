import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { skipWaiting, clientsClaim } from 'workbox-core';

skipWaiting();
clientsClaim();

// Precache berdasarkan manifest InjectManifest
precacheAndRoute(self.__WB_MANIFEST);

// Cache JS dan CSS
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  }),
);

// Cache fonts
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'font-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 tahun
      }),
    ],
  }),
);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
      }),
    ],
  }),
);

// Cache API dari Dicoding
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',
  new NetworkFirst({
    cacheName: 'api-responses',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24, // 1 hari
      }),
    ],
  }),
);

// event push notification
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Anda memiliki cerita baru yang bisa dibaca!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
    }
  };

  event.waitUntil(
    self.registration.showNotification('StoryShare', options)
  );
});

// Notification click behavior
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = new URL('/', self.location.origin).href;

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  }).then((windowClients) => {
    const matchingClient = windowClients.find((client) => client.url === urlToOpen);

    if (matchingClient) {
      return matchingClient.focus();
    }

    return clients.openWindow(urlToOpen);
  });

  event.waitUntil(promiseChain);
});

precacheAndRoute([
  { url: '/index.html', revision: '1' },
  { url: '/', revision: '1' },
  { url: '/icons/icon-192x192.png', revision: '1' },
  { url: '/icons/icon-512x512.png', revision: '1' },
  { url: '/styles/main.css', revision: '1' },
]);


registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24, // 1 hari
      }),
    ],
  }),
);