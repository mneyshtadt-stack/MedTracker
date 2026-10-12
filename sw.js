// Minimal service worker. It doesn't cache anything or serve offline -- every request still hits the
// network, so the page always shows live data. The fetch listener is there for Chrome's install
// criteria; the push listeners show MedTracker's reminders (sent by the proxy at the set times).
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data && event.data.text() }; }
  event.waitUntil(self.registration.showNotification(data.title || 'MedTracker', {
    body: data.body || '',
    tag: data.tag || 'medtracker',
    renotify: true,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: data.url || './#today' },
  }));
});

// Tapping a reminder brings MedTracker to the front (or opens it) on the Today card.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || './#today', self.registration.scope).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
    for (const w of wins) {
      if (w.url.startsWith(self.registration.scope)) { w.navigate(target).catch(() => {}); return w.focus(); }
    }
    return self.clients.openWindow(target);
  }));
});
