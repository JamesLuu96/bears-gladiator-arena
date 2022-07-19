self.addEventListener("install", e=>{
    console.log("installed")
    e.waitUntil(
        caches.open("static").then(cache => {
            return cache.addAll(["./", "./script.js", "./bear-head.jpg", "./styles.css", "./assets", "./icons"])
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