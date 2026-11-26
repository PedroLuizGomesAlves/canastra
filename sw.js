// Service worker: guarda os arquivos no celular para o app abrir sem internet.
// Ao mudar qualquer arquivo do app, aumente o número da versão abaixo.
var VERSAO = "canastra-v3";
var ARQUIVOS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./css/style.css", "./js/app.js",
  "./fonts/inter-latin-400-normal.woff2", "./fonts/inter-latin-500-normal.woff2", "./fonts/inter-latin-600-normal.woff2",
  "./fonts/dm-serif-display-latin-400-normal.woff2",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(nomes.filter(function (n) { return n !== VERSAO; }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Cache primeiro; se o arquivo não estiver guardado, busca na rede.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || fetch(e.request); })
  );
});
