const cacheName = 'cache-v1';
const precacheResources = [
    '/',
    'index.html',
    // CSS
    'css/vendor/boilerplate.css',
    'css/vendor/nes-2.2.0.min.css',
    'css/main.css',
    // Fonts
    'fonts/press-start-2p-v8-latin-regular.eot',
    'fonts/press-start-2p-v8-latin-regular.woff2',
    'fonts/press-start-2p-v8-latin-regular.woff',
    'fonts/press-start-2p-v8-latin-regular.ttf',
    'fonts/press-start-2p-v8-latin-regular.svg',
    // JavaScript
    'js/vendor/jquery-3.4.1.min.js',
    'js/vendor/jquery-touch-click.js',
    'js/vendor/screenfull-4.2.1.min.js',
    'js/vendor/microbit-0.4.0.umd.js',
    'js/microbitBle.js',
    'js/sound.js',
    'js/main.js',
    // Images
    'img/full-screen.png',
    // Icons
    'favicon.ico?v1.0=OmKy4kNd7W',
    'img/icons/favicon-16x16.png?v1.0=OmKy4kNd7W',
    'img/icons/favicon-32x32.png?v1.0=OmKy4kNd7W',
    'img/icons/apple-touch-icon.png?v1.0=OmKy4kNd7W',
    'img/icons/safari-pinned-tab.svg?v1.0=OmKy4kNd7W',
    'img/icons/android-chrome-512x512.png?v1.0=OmKy4kNd7W',
    'img/icons/android-chrome-192x192.png?v1.0=OmKy4kNd7W',
];

self.addEventListener('install', event => {
    console.log('Service worker install.');
    event.waitUntil(caches.open(cacheName).then(cache => {
        return cache.addAll(precacheResources);
    }));
});

self.addEventListener('activate', event => {
    console.log('Service worker activated.');
});

self.addEventListener('fetch', event => {
    console.log('Fetch intercepted for:', event.request.url);
    event.respondWith(caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
            return cachedResponse;
        }
        return fetch(event.request);
    }));
});
