// 単純明快キャッシュ。更新時は VERSION を上げるだけ。
const VERSION = "v1.0.0";
const CACHE_NAME = `hippoly-cache-${VERSION}`;
const URLS_TO_CACHE = [
  "./hippoly.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// インストール時に必要ファイルをキャッシュ
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

// 有効化時に古いキャッシュを掃除
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// キャッシュ優先。ナビゲーションはオフライン時に hippoly.html へフォールバック
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./hippoly.html"))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(res => res || fetch(req))
  );
});
