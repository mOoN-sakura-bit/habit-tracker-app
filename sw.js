const CACHE_NAME = 'habit-tracker-v1.1.0'; // バージョンアップ
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Service Worker インストール
self.addEventListener('install', event => {
  console.log('[SW] Install event - v1.1.0');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting(); // 即座に新しいSWを有効化
      })
  );
});

// Service Worker アクティベート
self.addEventListener('activate', event => {
  console.log('[SW] Activate event - v1.1.0');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// ネットワークリクエストの処理（改善版）
self.addEventListener('fetch', event => {
  // HTMLファイルは常にネットワークから取得を試行
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // ネットワーク成功時はキャッシュも更新
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // ネットワーク失敗時のみキャッシュから返す
          return caches.match(event.request);
        })
    );
    return;
  }

  // その他のリソース
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// アップデート検知
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
