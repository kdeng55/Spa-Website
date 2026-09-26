// Service worker: saves the whole site on the first visit so it works offline.
// Bump CACHE_VERSION whenever any file changes, so visitors get the new version.
const CACHE_VERSION = "v1";
const CACHE_NAME = `spa-sound-boxes-${CACHE_VERSION}`;

const PRECACHE = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "manifest.webmanifest",
  "images/logo.png",
  "images/icons/icon-192.png",
  "images/icons/icon-512.png",
  "images/icons/maskable-512.png",
  "images/icons/apple-touch-icon.png",
  "sounds/goat.m4a",
  "sounds/cat.m4a",
  "sounds/cow.m4a",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Safari asks for audio in byte ranges; answer those from the cached file.
async function rangeResponse(request, response) {
  const buffer = await response.arrayBuffer();
  const match = /bytes=(\d*)-(\d*)/.exec(request.headers.get("range"));
  const start = match && match[1] ? Number(match[1]) : 0;
  const end = match && match[2] ? Number(match[2]) : buffer.byteLength - 1;
  return new Response(buffer.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "audio/mp4",
      "Content-Range": `bytes ${start}-${end}/${buffer.byteLength}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true, ignoreVary: true });

    if (cached) {
      return request.headers.has("range") ? rangeResponse(request, cached) : cached;
    }

    // Not saved yet (e.g. Google Fonts): fetch it and keep a copy for next time.
    try {
      const response = await fetch(request);
      if (response.status === 200 || response.type === "opaque") {
        cache.put(request, response.clone());
      }
      return response;
    } catch (err) {
      if (request.mode === "navigate") return cache.match("index.html");
      throw err;
    }
  })());
});
