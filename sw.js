const CACHE_NAME = 'habit-tracker-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// インストール時
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチ時（オフライン対応）
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュがある場合はそれを返す、なければネットから取得
        return response || fetch(event.request);
      })
  );
});