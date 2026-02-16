const CACHE_NAME = 'synthwave-calculator-v4'; // Bump version to force update
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // App source files
  '/index.tsx',
  '/App.tsx',
  '/components/Button.tsx',
  // Key CDN assets for offline functionality
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@19.0.0-rc.0',
  'https://esm.sh/react-dom@19.0.0-rc.0/client',
  'https://esm.sh/react@19.0.0-rc.0/jsx-runtime'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use a more robust addAll that doesn't fail if one request fails
        const promises = urlsToCache.map(url => {
            return fetch(url).then(response => {
                if (!response.ok) {
                    // Don't cache non-2xx responses
                    console.error('Failed to fetch and cache:', url, response.status);
                    return Promise.resolve(); // Continue without failing the whole cache
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
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200) {
              return response;
            }
            
            // IMPORTANT: Don't cache opaque responses to avoid filling up storage with errors
            if (response.type !== 'basic' && response.type !== 'cors') {
                return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
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
            return caches.delete(cacheName); // Deleting old caches
          }
        })
      );
    })
  );
});