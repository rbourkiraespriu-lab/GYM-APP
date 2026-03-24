const CACHE = 'gymtrack-premium-v10';
const FILES = [
  './index.html',
  './styles.css',
  './data.js',
  './state.js',
  './scanner.js',
  './features.js',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Ignorar peticiones a la API de Gemini Vision para no estropear la captura
  if (e.request.url.includes('generativelanguage.googleapis.com')) {
    return fetch(e.request);
  }
  
  e.respondWith(
    caches.match(e.request).then(cached => {
      // Return cached response if found
      if (cached) return cached;
      
      // Fallback a fetch normal
      return fetch(e.request).then(response => {
        // Cachear imágenes de ejercicios dinámicamente
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clonar la respuesta
        const responseToCache = response.clone();
        
        caches.open(CACHE).then(cache => {
          cache.put(e.request, responseToCache);
        });
        
        return response;
      });
    })
  );
});
