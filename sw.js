const CACHE = "peaknova-v2";

const CORE = [
  "./login.html",
  "./dashboard.html",
  "./admin.html",
  "./kiosk.html",
  "./manifest.json",
  "./css/style.css",
  "./js/firebase.js",
  "./js/auth.js",
  "./js/app.js",
  "./js/sync.js",
  "./js/utils.js",
  "./images/pln-logo.jpg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(CORE.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate: instant from cache, refreshed in background
function swr(req) {
  return caches.open(CACHE).then((cache) =>
    cache.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => { if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()); return res; })
        .catch(() => hit);
      return hit || net;
    })
  );
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never touch live Firebase data/auth calls
  if (url.hostname.endsWith("googleapis.com") && url.hostname !== "fonts.googleapis.com") return;
  if (url.hostname.includes("firebaseio.com") || url.hostname.includes("identitytoolkit")) return;

  // Pinned SDK + fonts: safe to serve from cache and refresh quietly
  if (url.hostname === "www.gstatic.com" || url.hostname === "fonts.gstatic.com" || url.hostname === "fonts.googleapis.com") {
    e.respondWith(swr(req));
    return;
  }

  // Own pages/scripts/images: stale-while-revalidate, offline fallback built in
  if (url.origin === location.origin) {
    e.respondWith(swr(req));
  }
});
