const GHPATH = '/bears-gladiator-arena'
const APP_PREFIX = 'bga_'
const VERSION = 'version_00'
const URLS = [
    `${GHPATH}/`,
    `${GHPATH}/script.js`,
    `${GHPATH}/bear-head.jpg`,
    `${GHPATH}/styles.css`,
    `${GHPATH}/assets/pics/baby-bear-1.jpg`,
    `${GHPATH}/assets/pics/baby-bear-2.jpg`,
    `${GHPATH}/assets/pics/baby-bear-3.jpg`,
    `${GHPATH}/assets/pics/baby-bear-4.jpg`,
    `${GHPATH}/assets/pics/baby-bear-5.jpg`,
    `${GHPATH}/assets/pics/baby-bear-6.jpg`,
    `${GHPATH}/assets/pics/baby-bear-7.jpg`,
    `${GHPATH}/assets/pics/mama-bear-1.jpg`,
    `${GHPATH}/assets/pics/mama-bear-2.jpg`,
    `${GHPATH}/assets/pics/mama-bear-3.jpg`,
    `${GHPATH}/assets/pics/mama-bear-4.jpg`,
    `${GHPATH}/assets/pics/mama-bear-5.jpg`,
    `${GHPATH}/assets/pics/mama-bear-6.jpg`,
    `${GHPATH}/assets/pics/mama-bear-7.jpg`,
    `${GHPATH}/assets/pics/papa-bear-1.jpg`,
    `${GHPATH}/assets/pics/papa-bear-2.jpg`,
    `${GHPATH}/assets/pics/papa-bear-3.jpg`,
    `${GHPATH}/assets/pics/papa-bear-4.jpg`,
    `${GHPATH}/assets/pics/papa-bear-5.jpg`,
    `${GHPATH}/assets/pics/papa-bear-6.jpg`,
    `${GHPATH}/assets/pics/papa-bear-7.jpg`
]

const CACHE_NAME = APP_PREFIX + VERSION

self.addEventListener('fetch', function (e) {
  console.log('Fetch request : ' + e.request.url);
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) { 
        console.log('Responding with cache : ' + e.request.url);
        return request
      } else {       
        console.log('File is not cached, fetching : ' + e.request.url);
        return fetch(e.request)
      }
    })
  )
})

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('Installing cache : ' + CACHE_NAME);
      return cache.addAll(URLS)
    })
  )
})

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      var cacheWhitelist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX)
      })
      cacheWhitelist.push(CACHE_NAME);
      return Promise.all(keyList.map(function (key, i) {
        if (cacheWhitelist.indexOf(key) === -1) {
          console.log('Deleting cache : ' + keyList[i] );
          return caches.delete(keyList[i])
        }
      }))
    })
  )
})