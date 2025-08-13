// Service Worker for Church Donation System PWA
const CACHE_NAME = 'church-donation-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/manifest-dark.json'
];

// 테마별 아이콘 캐싱
const iconSizes = ['16x16', '32x32', '72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512'];
const iconUrls = [];

// 브라이트 모드 아이콘
iconSizes.forEach(size => {
  iconUrls.push(`/icons/coms_b-${size}.png`);
});

// 다크 모드 아이콘
iconSizes.forEach(size => {
  iconUrls.push(`/icons/coms_d-${size}.png`);
});

// ICO 파일들
iconUrls.push('/coms_b.ico', '/coms_d.ico', '/favicon.ico');

// Install Event
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        // 기본 URL 캐싱
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('Service Worker: Basic files cached');
            // 아이콘 캐싱 (개별적으로 처리하여 일부 실패해도 전체가 실패하지 않도록)
            return Promise.allSettled(
              iconUrls.map(url => 
                cache.add(url)
                  .then(() => console.log(`Cached: ${url}`))
                  .catch(err => console.warn(`Failed to cache: ${url}`, err))
              )
            );
          });
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('Service Worker: Installation failed', err);
      })
  );
});

// Activate Event
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // manifest 파일 요청 처리 (항상 최신 버전 확인)
  if (requestUrl.pathname.includes('manifest.json') || requestUrl.pathname.includes('manifest-dark.json')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            // 캐시 업데이트
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // 오프라인 시 캐시에서 반환
          return caches.match(event.request);
        })
    );
    return;
  }

  // 아이콘 요청 처리
  if (requestUrl.pathname.includes('/icons/') || requestUrl.pathname.endsWith('.ico')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then(response => {
              // 성공적인 응답만 캐싱
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return response;
            });
        })
    );
    return;
  }

  // 기타 요청 처리 (네트워크 우선)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 유효한 응답인지 확인
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // HTML, CSS, JS 파일만 캐싱
        if (requestUrl.pathname.endsWith('.html') || 
            requestUrl.pathname.endsWith('.css') || 
            requestUrl.pathname.endsWith('.js') ||
            requestUrl.pathname === '/') {
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }

        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 반환
        return caches.match(event.request);
      })
  );
});

// 테마 변경 메시지 처리
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'THEME_CHANGED') {
    console.log('Service Worker: Theme changed to:', event.data.theme);
    
    // 새 테마에 맞는 manifest 캐싱
    const manifestUrl = event.data.theme === 'dark' 
      ? '/manifest-dark.json' 
      : '/manifest.json';
    
    caches.open(CACHE_NAME)
      .then(cache => {
        return fetch(manifestUrl)
          .then(response => {
            if (response && response.status === 200) {
              cache.put(manifestUrl, response);
              console.log('Service Worker: New manifest cached');
            }
          });
      });
    
    // 클라이언트에 업데이트 알림
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'THEME_UPDATED',
          theme: event.data.theme
        });
      });
    });
  }

  // PWA 설치 상태 확인
  if (event.data && event.data.type === 'CHECK_INSTALL_STATUS') {
    event.ports[0].postMessage({
      type: 'INSTALL_STATUS',
      canInstall: true,
      isInstalled: false
    });
  }
});

// 백그라운드 동기화
self.addEventListener('sync', event => {
  if (event.tag === 'sync-donations') {
    event.waitUntil(syncDonations());
  }
});

async function syncDonations() {
  try {
    console.log('Service Worker: Syncing donations...');
    // 오프라인에서 저장된 데이터 동기화 로직 구현
    // IndexedDB에서 동기화할 데이터 가져오기
    // 서버로 전송
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
  }
}

// 푸시 알림 처리 (향후 확장)
self.addEventListener('push', event => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/coms_b-192x192.png',
      badge: '/icons/coms_b-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification('교회 헌금관리시스템', options)
    );
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});