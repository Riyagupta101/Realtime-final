// ✅ Service Worker for Real-Time Chat Notifications - FINAL VERSION

const CACHE_NAME = 'chat-app-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png'
];

// ---------------------------
// INSTALL EVENT
// ---------------------------
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('[Service Worker] Caching essential resources safely...');
        for (const url of urlsToCache) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response.clone());
              console.log(`[Service Worker] Cached: ${url}`);
            } else {
              console.warn(`[Service Worker] Skipped (not found): ${url}`);
            }
          } catch (err) {
            console.warn(`[Service Worker] Failed to cache ${url}:`, err);
          }
        }
      })
      .then(() => {
        console.log('[Service Worker] Installation complete ✅');
        return self.skipWaiting();
      })
  );
});

// ---------------------------
// ACTIVATE EVENT
// ---------------------------
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ---------------------------
// FETCH EVENT (Offline Support)
// ---------------------------
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request).catch(() => {
          console.warn('[Service Worker] Offline: Returning cached response if available');
          return caches.match('/');
        });
      })
  );
});

// ---------------------------
// PUSH EVENT (Notification Handler)
// ---------------------------
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push event received 💬', event.data ? event.data.text() : '(no data)');

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'Chat Message', body: event.data.text() };
    }
  }

  const title = data.title || 'New Chat Message';
  const options = {
    body: data.body || 'You have a new message.',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    data: data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ---------------------------
// CLICK EVENT (Open Chat Page)
// ---------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
