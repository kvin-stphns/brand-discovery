/* eslint-disable no-console */
const { PlaywrightCrawler, RequestQueue, log } = require('crawlee')
const { chromium } = require('playwright')
const { upsertProduct, fromJsonLd, parsePrice, normalizeImageUrl, pickLargestFromSrcSet, firecrawlExtract, normalizeText } = require('./common')

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

function extractSourceIdFromUrl(url) {
  const m = String(url).match(/(?:item|product)[-\/](\d{6,})/i) || String(url).match(/[?&](?:cod|id)=(\d{6,})/i)
  return m ? m[1] : String(url)
}

function seedUrls() {
  const seeds = [
    'https://www.farfetch.com/shopping/men/items.aspx?view=180',
    'https://www.farfetch.com/shopping/women/items.aspx?view=180',
  ]
  // Aggressive pagination seeding
  for (let i = 2; i <= 20; i++) {
    seeds.push(`https://www.farfetch.com/shopping/men/items.aspx?page=${i}&view=180`)
    seeds.push(`https://www.farfetch.com/shopping/women/items.aspx?page=${i}&view=180`)
  }

  const env = (process.env.SCRAPE_URLS_FF || process.env.SEED_LIST_URLS_FF || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return env.length ? env : seeds
}

async function runFarfetch({ maxItems = 1000, maxPages = 100 } = {}) {
  log.setLevel(log.LEVELS.INFO)
  const queue = await RequestQueue.open()
  for (const u of seedUrls()) await queue.addRequest({ url: u, label: 'LIST' })
  const productSeeds = (process.env.SCRAPE_PRODUCT_URLS_FF || process.env.SEED_PRODUCT_URLS_FF || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  for (const u of productSeeds) await queue.addRequest({ url: u, label: 'DETAIL' })

  let seen = 0
  let firecrawl = { used: 0 }

  const crawler = new PlaywrightCrawler({
    requestQueue: queue,
    maxRequestsPerCrawl: maxItems * 10, // Allow significantly more requests for deep pagination
    maxConcurrency: 8,
    browserPoolOptions: { useFingerprints: true },
    useSessionPool: true,
    navigationTimeoutSecs: 45,
    requestHandlerTimeoutSecs: 120,
    async requestHandler({ request, page, enqueueLinks }) {
      const { label } = request
      if (label === 'LIST') {
        await page.goto(request.url, { waitUntil: 'domcontentloaded' })
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { })

        const links = await page.$$('a[href*="-item-"]')
        const hrefs = await Promise.all(links.slice(0, 3).map(l => l.getAttribute('href')))
        console.log(`[farfetch] found ${links.length} links. First 3:`, hrefs)

        // Enqueue product detail links
        const info = await enqueueLinks({
          selector: 'a[href*="-item-"]',
          label: 'DETAIL',
        })
        console.log(`[farfetch] enqueued ${info.processedRequests.length} products from list`)

        // Enqueue pagination - aggressive
        await enqueueLinks({ strategy: 'same-domain', globs: ['**page=**', '**view=**'], label: 'LIST' })
        return
      }

      // DETAIL
      await page.goto(request.url, { waitUntil: 'domcontentloaded' })
      // Robust delay to avoid 429
      await delay(2000 + Math.random() * 3000)
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { })

      const sourceId = extractSourceIdFromUrl(request.url)
      const base = { source: 'farfetch', sourceId, canonicalUrl: request.url }

      // JSON-LD first
      const ldRaw = await page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.map((n) => n.textContent || '').join('\n')).catch(() => '')
      let extracted = fromJsonLd(ldRaw)

      // Robust DOM Parsing (Primary Strategy now due to JSON-LD issues)
      const domBrand = (await page.$eval('[data-testid="brand-name"], [data-tstid="brandName"], [data-component="BrandName"]', el => el.textContent?.trim()).catch(() => '')) ||
        (await page.$eval('h1 a', el => el.textContent?.trim()).catch(() => '')) || '';

      let domName = (await page.$eval('[data-testid="product-short-description"], [data-tstid="cardShortDescription"]', el => el.textContent?.trim()).catch(() => '')) ||
        (await page.$eval('h1, h2', el => el.textContent?.trim()).catch(() => '')) || '';

      // Clean Title Logic: Remove Brand from Name if present
      if (domBrand && domName.toLowerCase().startsWith(domBrand.toLowerCase())) {
        domName = domName.slice(domBrand.length).trim();
      }

      // Price Parsing
      const priceText = (await page.$eval('[data-testid="price"], [data-tstid="priceInfo-original"]', el => el.textContent?.trim()).catch(() => '')) || '';
      const saleText = (await page.$eval('[data-testid="sale-price"]', el => el.textContent?.trim()).catch(() => '')) || '';

      let finalPrice = { value: undefined, currency: 'USD' };
      const extractPrice = (str) => {
        const m = str.match(/([$€£])?\s?([\d,.]+)/);
        if (!m) return null;
        return {
          currency: ({ '$': 'USD', '€': 'EUR', '£': 'GBP' }[m[1] || '$'] || 'USD'),
          value: Number(m[2].replace(/[,.](?=\d{3}\b)/g, '').replace(',', '.'))
        };
      };
      const pSale = extractPrice(saleText);
      const pReg = extractPrice(priceText);

      if (pSale) finalPrice = pSale;
      else if (pReg) finalPrice = pReg;

      // Image Parsing (Gallery)
      const galleryImages = await page.$$eval(
        '[data-testid="product-gallery"] img, [data-testid="gallery-image"]',
        imgs => imgs.map(img => img.src || img.srcset?.split(' ')[0]).filter(src => src && !src.includes('placeholder') && !src.includes('blank'))
      ).catch(() => []);

      let domImgs = galleryImages;
      if (domImgs.length === 0) {
        domImgs = await page.$$eval('img', (els) => els.map(e => e.src).filter(s => s.includes('farfetch.com') && s.length > 50 && (e.naturalWidth > 400 || e.width > 400)));
      }
      domImgs = Array.from(new Set(domImgs));

      // Merge with JSON-LD if available, but prefer DOM for clean titles
      if (!extracted || !extracted.title || extracted.title.length > 100) {
        extracted = {
          title: normalizeText(domName || extracted?.title),
          brand: normalizeText(domBrand || extracted?.brand),
          price: finalPrice.value ? finalPrice : (extracted?.price || { value: undefined, currency: 'USD' }),
          images: domImgs.length > 0 ? domImgs.map(normalizeImageUrl) : (extracted?.images || [])
        }
      } else {
        // If JSON-LD is good, just ensure we have the gallery images
        if (domImgs.length > extracted.images?.length) {
          extracted.images = domImgs.map(normalizeImageUrl);
        }
      }

      // Filter out error pages or bad data
      if (extracted.title.includes('429') || extracted.title.includes('Too Many Requests') || extracted.title.includes('Access Denied') || extracted.title.includes('Just a moment')) {
        console.log(`[farfetch] Skipping error page: ${request.url}`)
        return
      }

      // Clean up bloated titles (remove JSON-like or long metadata if detected)
      if (extracted.title.length > 150 || extracted.title.includes('{') || extracted.title.includes('var(')) {
        // Try to fallback to brand + "Item" if title is garbage
        if (extracted.brand) extracted.title = `${extracted.brand} Item`
        else extracted.title = 'Product'
      }

      // Infer gender from URL
      let gender = 'Unisex';
      if (request.url.includes('/men/')) gender = 'Men';
      if (request.url.includes('/women/')) gender = 'Women';

      // Firecrawl rescue for missing criticals
      if ((!extracted.images?.length || !extracted.brand || !extracted.price?.value) && process.env.FIRECRAWL_API_KEY) {
        const schema = {
          title: 'string',
          brand: 'string',
          images: ['string'],
          price: { value: 'number', currency: 'string' },
          description: 'string',
          details: ['string'],
          sizes: ['string']
        }
        const out = await firecrawlExtract(request.url, schema, { budget: Number(process.env.FIRECRAWL_BUDGET || 500), used: firecrawl.used })
        firecrawl.used = out.used
        if (out.data) {
          extracted = { ...extracted, ...out.data }
        }
      }

      const doc = {
        ...base,
        title: extracted.title || '',
        brand: extracted.brand || '',
        price: extracted.price || { value: undefined, currency: 'USD' },
        images: (extracted.images || []).map((u) => normalizeImageUrl(u)),
        description: extracted.description || '',
        details: extracted.details || [],
        sizes: extracted.sizes || [],
        gender,
      }

      // Final Title Cleaning (Strict)
      if (doc.title) {
        doc.title = doc.title.replace(/\|\s*FARFETCH/i, '').replace(/\|\s*Farfetch/i, '').trim();
        if (doc.brand && doc.title.toLowerCase().startsWith(doc.brand.toLowerCase())) {
          doc.title = doc.title.slice(doc.brand.length).trim();
        }
        // Remove leading " - " or " | " if left over
        doc.title = doc.title.replace(/^[-|]\s+/, '');
      }

      await upsertProduct(doc)
      seen += 1
      if (seen >= maxItems) {
        await crawler.teardown()
      }
    },
  })

  await crawler.run()
  return { ok: true, insertedOrUpdated: seen, firecrawlUsed: firecrawl.used }
}

module.exports = { runFarfetch }
