// Offline support for the portfolio.
//
// On install, crawls the site from the home page and caches every page,
// image, video and stylesheet it links to, so the whole site works offline
// after one visit.
//
// Videos need special handling: Chrome requests them with a Range header and
// gets back 206 Partial Content, which the Cache API refuses to store. So each
// video is fetched once in full (no Range header) and cached, and range
// requests are answered by slicing the cached file.
//
// Bump CACHE when you replace a video or image under the same file name.

const CACHE = 'site-v1';
const START_PAGES = ['/'];
const MAX_PAGE_DEPTH = 2;
// Large originals that pages don't link to are never crawled, so they are not cached.
const SKIP = [/\/projects\/dp_/, /\.heic$/i];
const EXTRA_ORIGINS = ['https://cdn.jsdelivr.net'];

const isHtml = (url) => url.pathname.endsWith('/') || url.pathname.endsWith('.html') || !/\.[a-z0-9]+$/i.test(url.pathname);

function cacheable(url) {
  if (url.origin !== self.location.origin && !EXTRA_ORIGINS.includes(url.origin)) return false;
  if (url.pathname === '/sw.js') return false;
  return !SKIP.some((re) => re.test(url.pathname));
}

function linksIn(html, base) {
  const found = new Set();
  const re = /(?:src|href|poster)\s*=\s*["']([^"'#]+)/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const url = new URL(m[1].replace(/&amp;/g, '&'), base);
      if (/^https?:$/.test(url.protocol)) found.add(url.href);
    } catch (e) { /* ignore bad URLs */ }
  }
  return [...found];
}

async function crawl() {
  const cache = await caches.open(CACHE);
  const seen = new Set();
  let pages = START_PAGES.map((p) => new URL(p, self.location.origin).href);
  const assets = new Set();

  for (let depth = 0; depth <= MAX_PAGE_DEPTH && pages.length; depth++) {
    const next = [];
    for (const href of pages) {
      if (seen.has(href)) continue;
      seen.add(href);
      try {
        const res = await fetch(href, { cache: 'no-cache' });
        if (!res.ok) continue;
        await cache.put(href, res.clone());
        for (const link of linksIn(await res.text(), href)) {
          const url = new URL(link);
          if (!cacheable(url)) continue;
          if (url.origin === self.location.origin && isHtml(url)) next.push(url.href);
          else assets.add(url.href);
        }
      } catch (e) { /* skip pages that fail */ }
    }
    pages = next;
  }

  // Fetch assets a few at a time; one failure should not abort the rest.
  const list = [...assets];
  const workers = Array.from({ length: 4 }, async () => {
    while (list.length) {
      const href = list.shift();
      try {
        if (await cache.match(href)) continue;
        const res = await fetch(href, { cache: 'no-cache' });
        if (res.ok && res.status === 200) await cache.put(href, res);
      } catch (e) { /* skip */ }
    }
  });
  await Promise.all(workers);
}

self.addEventListener('install', (event) => {
  event.waitUntil(crawl().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

// Answer a Range request from a full cached copy.
async function rangeResponse(full, rangeHeader) {
  const blob = await full.blob();
  const m = /bytes=(\d*)-(\d*)/.exec(rangeHeader || '');
  let start = 0;
  let end = blob.size - 1;
  if (m) {
    if (m[1] === '' && m[2] !== '') {
      start = Math.max(0, blob.size - Number(m[2]));
    } else {
      start = Number(m[1] || 0);
      if (m[2] !== '') end = Math.min(Number(m[2]), blob.size - 1);
    }
  }
  if (start >= blob.size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${blob.size}` } });
  }
  const part = blob.slice(start, end + 1);
  return new Response(part, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': full.headers.get('Content-Type') || 'video/mp4',
      'Content-Length': String(part.size),
      'Content-Range': `bytes ${start}-${end}/${blob.size}`,
      'Accept-Ranges': 'bytes',
    },
  });
}

async function handleAsset(request) {
  const cache = await caches.open(CACHE);
  const key = request.url;
  let cached = await cache.match(key);
  if (!cached) {
    // Fetch the whole file without a Range header so it can be cached.
    const res = await fetch(key, { cache: 'no-cache' });
    if (res.status !== 200) return res;
    await cache.put(key, res.clone());
    cached = res;
  }
  const range = request.headers.get('Range');
  return range ? rangeResponse(cached, range) : cached;
}

// Re-crawl at most once an hour while online, so new pages and videos get
// cached without bumping CACHE. Files already in the cache are not refetched.
let lastCrawl = Date.now();

async function handlePage(request, event) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) await cache.put(request.url.split('#')[0], res.clone());
    if (Date.now() - lastCrawl > 60 * 60 * 1000) {
      lastCrawl = Date.now();
      event.waitUntil(crawl().catch(() => {}));
    }
    return res;
  } catch (e) {
    const url = new URL(request.url);
    url.search = '';
    url.hash = '';
    return (await cache.match(url.href)) ||
      (await cache.match(url.href.replace(/\/$/, '/index.html'))) ||
      (await cache.match(url.href + '.html')) ||
      new Response('<h1>Offline</h1><p>This page has not been saved for offline use yet.</p>',
        { status: 503, headers: { 'Content-Type': 'text/html' } });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!cacheable(url)) return;

  if (request.mode === 'navigate') {
    // Pages: network first so edits show up, cache when offline.
    event.respondWith(handlePage(request, event));
  } else {
    // Images, videos, CSS, scripts: cache first.
    event.respondWith(handleAsset(request).catch(() => fetch(request)));
  }
});
