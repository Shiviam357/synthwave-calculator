const CACHE_NAME = 'synthwave-calculator-v5'; // Bump version to force update
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  './App.tsx',
  './components/Button.tsx',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://esm.sh/react@19.0.0/jsx-runtime'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        const promises = urlsToCache.map(url => {
            return fetch(url).then(response => {
                if (!response.ok) {
                    console.error('Failed to fetch and cache:', url, response.status);
                    return Promise.resolve();
                }
                return cache.put(url, response);
            }).catch(err => {
                console.error('Failed to fetch and cache:', url, err);
            });
        });
        return Promise.all(promises);
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(
          response => {
            if (!response || response.status !== 200) return response;
            if (response.type !== 'basic' && response.type !== 'cors') return response;

            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
            });
            return response;
          }
        );
      })
    );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});