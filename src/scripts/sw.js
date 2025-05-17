// src/scripts/sw.js

import { precacheAndRoute } from 'workbox-precaching';

// Inject daftar file untuk precache saat build
precacheAndRoute(self.__WB_MANIFEST);

// Skip waiting saat install
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// Ambil alih kontrol saat activate
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push Notification
self.addEventListener('push', (event) => {
  const payload = event.data?.json() || {
    title: 'StoryShare',
    body: 'Ada cerita baru nih! Yuk lihat sekarang!',
    url: '/'
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: { url: payload.url }
    })
  );
});

// Handle klik notifikasi
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const client = clientList.find(c => c.url === event.notification.data.url);
      return client ? client.focus() : clients.openWindow(event.notification.data.url);
    })
  );
});
