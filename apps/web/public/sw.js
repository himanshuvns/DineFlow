// DineFlow Service Worker - Web Push Notifications & Fast Re-ordering
/* eslint-disable no-restricted-globals */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification received from FCM / Web Push Gateway
self.addEventListener('push', (event) => {
  let data = {
    title: '🎁 Exclusive Table Offer from DineFlow',
    body: 'A special dining perk is available for your table right now!',
    url: '/',
    promoCode: '',
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (err) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const title = data.title || 'DineFlow Special Offer';
  const options = {
    body: data.body || data.message || 'Tap to view your exclusive dining offer and re-order!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200, 100, 300],
    tag: data.promoCode || 'dineflow-offer',
    renotify: true,
    data: {
      url: data.url || data.deepLink || data.deepLinkUrl || '/',
      promoCode: data.promoCode,
    },
    actions: [
      { action: 'order', title: 'Claim & Order Now' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// User taps the system notification on their phone / desktop
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if already open on this restaurant
      for (const client of clientList) {
        if ('focus' in client && client.url.includes(targetUrl.split('?')[0])) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
