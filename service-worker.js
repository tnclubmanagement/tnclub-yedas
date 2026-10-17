---
layout: null
permalink: /service-worker.js
---
const CACHE_PREFIX = 'yedas';
const CACHE_VERSION = '{{ site.time | date: "%Y%m%d%H%M%S" }}';
const CACHE_NAME = `${CACHE_PREFIX}-v${CACHE_VERSION}`;

const BASE_URL = '{{ site.baseurl }}' || '';

const PRECACHE_URLS = [
  `${BASE_URL}/`,
  `${BASE_URL}/index.html`,
  `${BASE_URL}/aboutme/`,
  `${BASE_URL}/aboutme/index.html`,
  `${BASE_URL}/contact/`,
  `${BASE_URL}/contact/index.html`,
  `${BASE_URL}/tags/`,
  `${BASE_URL}/tags/index.html`,
  `${BASE_URL}/privacy/`,
  `${BASE_URL}/privacy/index.html`,
  `${BASE_URL}/404.html`,
  `${BASE_URL}/offline.html`,
  `${BASE_URL}/assets/css/beautifuljekyll.css`,
  `${BASE_URL}/assets/css/custom-styles.css`,
  `${BASE_URL}/assets/css/bootstrap-social.css`,
  `${BASE_URL}/assets/js/beautifuljekyll.js`,
  `${BASE_URL}/assets/js/custom-animations.js`,
  `${BASE_URL}/assets/img/icons/logo.svg`,
  `${BASE_URL}/assets/img/icons/favicon-16.png`,
  `${BASE_URL}/assets/img/icons/favicon-32.png`,
  `${BASE_URL}/assets/img/icons/apple-touch-icon.png`,
  `${BASE_URL}/assets/img/icons/icon-512.png`,
  'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.1/css/all.min.css',
  'https://code.jquery.com/jquery-3.5.1.slim.min.js',
  'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Precache failed:', url, err))
        )
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith(`${CACHE_PREFIX}-`) && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  const isAllowedCdn = [
    'stackpath.bootstrapcdn.com',
    'cdnjs.cloudflare.com',
    'code.jquery.com',
    'cdn.jsdelivr.net'
  ].includes(requestUrl.hostname);

  if (requestUrl.origin !== self.location.origin && !isAllowedCdn) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cached => {
              if (cached) return cached;
              if (requestUrl.pathname.endsWith('/')) {
                const indexRequest = new URL(requestUrl.pathname + 'index.html', self.location.origin);
                return caches.match(indexRequest);
              }
            })
            .then(cached => {
              if (cached) return cached;
              return caches.match(`${BASE_URL}/offline.html`);
            });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response && (response.ok || response.type === 'opaque')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
