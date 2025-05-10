self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('aquapulse-cache').then(cache => {
        return cache.addAll([
          '/index.html',
          '/styles.css',
          '/app.js',
          '/icon.png',
          '/icon-512.png'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  });
  
  self.addEventListener('sync', event => {
    if (event.tag === 'sync-reports') {
      event.waitUntil(syncReports());
    }
  });
  
  async function syncReports() {
    const cache = await caches.open('aquapulse-cache');
    const requests = await cache.match('/pending-reports');
    if (requests) {
      const data = await requests.json();
      console.log('Syncing report:', data);
      await cache.delete('/pending-reports');
    }
  }
  
  self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('/').then(() => {
        clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ screen: event.notification.data.screen });
          });
        });
      })
    );
  });