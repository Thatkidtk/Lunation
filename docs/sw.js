// Lunation Service Worker - Advanced PWA Implementation
// Phase 3: Offline-first, intelligent caching, and push notifications

const CACHE_NAME = 'lunation-v3.0.0';
const STATIC_CACHE = 'lunation-static-v3.0.0';
const DYNAMIC_CACHE = 'lunation-dynamic-v3.0.0';
const DATA_CACHE = 'lunation-data-v3.0.0';

// Determine base path dynamically (works for subpath hosting like GitHub Pages)
const SCOPE_URL = new URL(self.registration.scope);
const BASE_PATH = SCOPE_URL.pathname.endsWith('/')
  ? SCOPE_URL.pathname.slice(0, -1)
  : SCOPE_URL.pathname;
const p = (path) => `${BASE_PATH}${path}`;

// Files to cache for offline functionality
const STATIC_FILES = [
  p('/'),
  p('/index.html'),
  p('/manifest.json'),
  p('/favicon.svg')
];

// Install event - Cache static resources
self.addEventListener('install', event => {
  console.log('🚀 Lunation SW: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Lunation SW: Caching static files');
        return cache.addAll(STATIC_FILES.map(url => new Request(url, { cache: 'no-cache' })));
      })
      .catch(error => {
        console.warn('⚠️ Lunation SW: Cache installation failed:', error);
        // Continue installation even if some files fail to cache
        return Promise.resolve();
      })
  );
  
  // Immediately activate the new service worker
  self.skipWaiting();
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
  console.log('✅ Lunation SW: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old versions of caches
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== DATA_CACHE &&
              cacheName.startsWith('lunation-')) {
            console.log('🗑️ Lunation SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - Advanced caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests with appropriate strategies
  if (request.method === 'GET') {
    // Static assets - Cache first strategy
    if (isStaticAsset(request.url)) {
      event.respondWith(cacheFirstStrategy(request));
    }
    // API calls or dynamic content - Network first strategy
    else if (isApiRequest(request.url)) {
      event.respondWith(networkFirstStrategy(request));
    }
    // HTML pages - Stale while revalidate strategy
    else if (request.mode === 'navigate') {
      event.respondWith(staleWhileRevalidateStrategy(request));
    }
    // Other requests - Cache first with network fallback
    else {
      event.respondWith(cacheFirstStrategy(request));
    }
  }
});

// Cache First Strategy - For static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('🔄 Lunation SW: Cache first strategy failed:', error);
    return new Response('Offline - Resource unavailable', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network First Strategy - For API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('🌐 Lunation SW: Network first strategy failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'No network connection and no cached data available'
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale While Revalidate Strategy - For HTML pages
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.warn('🔄 Lunation SW: Network update failed:', error);
    return null;
  });
  
  // Return cached response immediately, update in background
  if (cachedResponse) {
    networkResponsePromise; // Fire and forget
    return cachedResponse;
  }
  
  // Wait for network response if no cache available
  const networkResponse = await networkResponsePromise;
  return networkResponse || createOfflinePage();
}

// Helper functions
function isStaticAsset(url) {
  return url.includes('/assets/') || 
         url.includes('/icons/') ||
         url.includes('.css') ||
         url.includes('.js') ||
         url.includes('.png') ||
         url.includes('.jpg') ||
         url.includes('.svg') ||
         url.includes('.woff') ||
         url.includes('.woff2');
}

function isApiRequest(url) {
  return url.includes('/api/') || 
         url.includes('api.') ||
         url.search(/\.(json|xml)$/) !== -1;
}

function createOfflinePage() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lunation - Offline</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #0b1020 0%, #1e293b 100%);
          color: #e6e8ef;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          text-align: center;
        }
        .offline-container {
          background: rgba(19, 26, 42, 0.95);
          padding: 3rem;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
          backdrop-filter: blur(10px);
          max-width: 400px;
        }
        .moon-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        h1 {
          color: #9b8cff;
          margin-bottom: 1rem;
        }
        p {
          color: #9aa3b2;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .retry-btn {
          background: linear-gradient(135deg, #9b8cff, #5ce0ff);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: transform 0.2s ease;
        }
        .retry-btn:hover {
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="moon-icon">🌙</div>
        <h1>Lunation</h1>
        <h2>You're Offline</h2>
        <p>Don't worry! Lunation works offline. Your data is safely stored locally and will sync when you're back online.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
  `, {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'text/html' }
  });
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('🔔 Lunation SW: Push notification received');
  
  if (!event.data) {
    console.warn('⚠️ Lunation SW: Push event without data');
    return;
  }
  
  try {
    const data = event.data.json();
      const options = {
        body: data.body,
      icon: p('/favicon.svg'),
      badge: p('/favicon.svg'),
        image: data.image,
        vibrate: [200, 100, 200],
        data: {
        url: data.url || p('/'),
          timestamp: Date.now()
        },
        actions: [
          {
            action: 'view',
            title: 'View Details',
          icon: p('/favicon.svg')
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
          icon: p('/favicon.svg')
          }
        ],
        tag: data.tag || 'lunation-general',
        renotify: true,
        requireInteraction: data.priority === 'high'
      };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('❌ Lunation SW: Push notification error:', error);
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('👆 Lunation SW: Notification clicked');
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'dismiss') {
    return; // Just close the notification
  }
  
  // Handle view action or notification click
  const urlToOpen = data.url || p('/');
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for data synchronization
self.addEventListener('sync', event => {
  console.log('🔄 Lunation SW: Background sync triggered');
  
  if (event.tag === 'cycle-data-sync') {
    event.waitUntil(syncCycleData());
  }
});

async function syncCycleData() {
  try {
    // This would sync with your backend when implemented
    console.log('📊 Lunation SW: Syncing cycle data...');
    
    // For now, just clean up old cached data
    const cache = await caches.open(DATA_CACHE);
    const requests = await cache.keys();
    
    // Remove cached data older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    for (const request of requests) {
      const response = await cache.match(request);
      const cachedDate = response.headers.get('date');
      
      if (cachedDate && new Date(cachedDate).getTime() < thirtyDaysAgo) {
        await cache.delete(request);
        console.log('🗑️ Lunation SW: Cleaned up old cached data:', request.url);
      }
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Lunation SW: Sync failed:', error);
    return Promise.reject(error);
  }
}

// Share target handling (for sharing cycle data)
self.addEventListener('share', event => {
  console.log('📤 Lunation SW: Share received');
  
  event.waitUntil(
    (async () => {
      const data = event.data;
      
      // Handle shared data (e.g., from healthcare providers)
      if (data.files && data.files.length > 0) {
        // Process shared files
        console.log('📁 Lunation SW: Processing shared files:', data.files.length);
      }
      
      if (data.text) {
        // Process shared text data
        console.log('📝 Lunation SW: Processing shared text data');
      }
      
      // Open the app to handle the shared data
      return clients.openWindow(p('/?shared=true'));
    })()
  );
});

console.log('🌙 Lunation Service Worker loaded - Advanced PWA ready!');
