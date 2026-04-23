const CACHE = 'weather-v2'
const PRECACHE = ['/', '/index.html', '/favicon.svg', '/manifest.webmanifest']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) return c.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow('/')
    })
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // Stale-while-revalidate for weather/news/quakes APIs:
  // return cache immediately (if any), update cache in background.
  if (url.hostname.includes('open-meteo.com') || url.hostname.includes('rss2json.com') || url.hostname.includes('usgs.gov')) {
    e.respondWith(
      caches.open(CACHE).then(async (c) => {
        const cached = await c.match(req)
        const network = fetch(req)
          .then((res) => {
            if (res.ok) c.put(req, res.clone())
            return res
          })
          .catch(() => cached)
        return cached || network
      })
    )
    return
  }

  // Cache-first for same-origin assets
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((hit) =>
        hit ||
        fetch(req).then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
          return res
        })
      )
    )
  }
})
