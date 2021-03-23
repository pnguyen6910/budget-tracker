const CACHE_NAME = 'static-cache-v2'
const DATA_CACHE_NAME = 'data-cache-v1'
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/manifest.webmanifest',
    '/style.css',
    '/index.js'
]


self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(DATA_CACHE_NAME)
            .then((cache) => cache.addAll("/api/transaction"))
            .then(self.skipWaiting())
    )

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(FILES_TO_CACHE))
    )
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map(cache => {
                        if (cache !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                            console.log("Old cache data removed", cache);
                            return caches.delete(cache);
                        }
                    }))
            })
    )
})

self.addEventListener('fetch', (event) => {
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(RUNTIME).then((cache) => {
                    return fetch(event.request).then((response) => {
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                });
            })
        );
    }
});
