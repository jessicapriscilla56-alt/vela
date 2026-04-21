// ── VELA SERVICE WORKER ──
const CACHE_NAME = 'vela-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Recebe notificações push
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  const title = data.title || 'Vela';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    tag: data.tag || 'vela-notif',
    renotify: true,
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// Clique na notificação abre o app na tela certa
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Notificações agendadas localmente
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    // Recebe o schedule e armazena
    const schedule = e.data.schedule || [];
    self.notificationSchedule = schedule;
  }
});
