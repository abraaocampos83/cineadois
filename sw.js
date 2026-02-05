// Nome do cache (útil para futuras atualizações)
const CACHE_NAME = 'cineadois-v1';

// Evento de instalação
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalado');
});

// Evento de ativação
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Ativado');
});

// Estrutura básica de fetch (necessária para ser instalável)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});