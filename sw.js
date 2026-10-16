// Guarda la página en el celular para que abra sin internet.
// Si cambias index.html, sube también este archivo con otro número de versión (v1 -> v2).
const V = "viaje-europa-v4";
const CORE = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  if (new URL(r.url).origin !== self.location.origin) return; // el clima y el tipo de cambio los maneja la página
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then((hit) => {
      const net = fetch(r)
        .then((res) => {
          if (res && res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); }
          return res;
        })
        .catch(() => hit || caches.match("./"));
      e.waitUntil(net.catch(() => {}));
      return hit || net;
    })
  );
});
