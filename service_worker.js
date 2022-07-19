const GHPATH = '/bears-gladiator-arena'
const APP_PREFIX = 'bga_'
const VERSION = 'version_00'
const URLS = [
    `${GHPATH}/`,
    `${GHPATH}/script.js`,
    `${GHPATH}/bear-head.jpg`,
    `${GHPATH}/styles.css`,
    `${GHPATH}/assets/pics/baby-bear-1`,
    `${GHPATH}/assets/pics/baby-bear-2`,
    `${GHPATH}/assets/pics/baby-bear-3`,
    `${GHPATH}/assets/pics/baby-bear-4`,
    `${GHPATH}/assets/pics/baby-bear-5`,
    `${GHPATH}/assets/pics/baby-bear-6`,
    `${GHPATH}/assets/pics/baby-bear-7`,
    `${GHPATH}/assets/pics/mama-bear-1`,
    `${GHPATH}/assets/pics/mama-bear-2`,
    `${GHPATH}/assets/pics/mama-bear-3`,
    `${GHPATH}/assets/pics/mama-bear-4`,
    `${GHPATH}/assets/pics/mama-bear-5`,
    `${GHPATH}/assets/pics/mama-bear-6`,
    `${GHPATH}/assets/pics/mama-bear-7`,
    `${GHPATH}/assets/pics/papa-bear-1`,
    `${GHPATH}/assets/pics/papa-bear-2`,
    `${GHPATH}/assets/pics/papa-bear-3`,
    `${GHPATH}/assets/pics/papa-bear-4`,
    `${GHPATH}/assets/pics/papa-bear-5`,
    `${GHPATH}/assets/pics/papa-bear-6`,
    `${GHPATH}/assets/pics/papa-bear-7`,
    `${GHPATH}/icons`
]

self.addEventListener("install", e=>{
    console.log("installed")
    e.waitUntil(
        caches.open("static").then(cache => {
            return cache.addAll(["./index.html", "./script.js", "./bear-head.jpg", "./styles.css", "./assets", "./icons"])
        })
    )
})

self.addEventListener("fetch", e=>{
    console.log(`itercept: ${e.request.url}`)
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request)
        })
    )
})