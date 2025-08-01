const CACHE_NAME = "pwa-cache-v1";

// Tilføj her de filer, du vil gøre tilgængelige offline
const urlsToCache = [
  "/",
  "/home",
  "/time-reg",
  "/daw",
  "/todo",
  "/images",
  "/manifest.json",
  "/icons/logo-192.png",
  "/icons/logo-256.png",
  "/icons/logo-512.png",
  "/offline.html", // fallback
];

// Install: cacher filerne
self.addEventListener("install", (event) => {
  console.log("🔧 Installing Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate: rydder gamle caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🗑 Removing old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch: server fra cache, ellers netværk, ellers offline.html
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Hvis fundet i cache
      if (response) return response;

      // Ellers prøv netværket
      return fetch(event.request).catch(() => {
        // Hvis offline og ingen netværk
        if (event.request.mode === "navigate") {
          return caches.match("/offline.html");
        }
      });
    })
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
