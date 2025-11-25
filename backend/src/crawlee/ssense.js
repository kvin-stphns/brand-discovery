/* eslint-disable no-console */
const { PlaywrightCrawler, RequestQueue, log } = require('crawlee')
const { upsertProduct, fromJsonLd, parsePrice, normalizeImageUrl, firecrawlExtract, normalizeText } = require('./common')

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

function extractSourceIdFromUrl(url) {
  const m = String(url).match(/(?:item|product)[-\/]?(\d{6,})/i) || String(url).match(/[?&](?:id|productId)=(\d{6,})/i)
  return m ? m[1] : String(url)
}

function seedUrls() {
  const seeds = [
    'https://www.ssense.com/en-us/men/all',
    'https://www.ssense.com/en-us/women/all',
  ]
  const env = (process.env.SCRAPE_URLS_SS || process.env.SEED_LIST_URLS_SS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return env.length ? env : seeds
}

async function runSsense({ maxItems = 1000 } = {}) {
  log.setLevel(log.LEVELS.INFO)
  const queue = await RequestQueue.open()
  for (const u of seedUrls()) await queue.addRequest({ url: u, label: 'LIST' })
  const productSeeds = (process.env.SCRAPE_PRODUCT_URLS_SS || process.env.SEED_PRODUCT_URLS_SS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  for (const u of productSeeds) await queue.addRequest({ url: u, label: 'DETAIL' })

  let seen = 0
  let firecrawl = { used: 0 }

  const crawler = new PlaywrightCrawler({
    requestQueue: queue,
    maxRequestsPerCrawl: maxItems * 3,
    maxConcurrency: 8,
    browserPoolOptions: { useFingerprints: true },
    useSessionPool: true,
    navigationTimeoutSecs: 45,
    requestHandlerTimeoutSecs: 120,
    async requestHandler({ request, page, enqueueLinks }) {
      const { label } = request
      if (label === 'LIST') {
        await page.goto(request.url, { waitUntil: 'domcontentloaded' })
        // Scroll to trigger lazy load
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { })

        // Debug links
        const links = await page.$$eval('a', as => as.map(a => a.href).filter(h => h.includes('/product/')));
        console.log(`[ssense] Found ${links.length} product links. First 3:`, links.slice(0, 3));

        await enqueueLinks({ strategy: 'same-domain', globs: ['**/product/**'], label: 'DETAIL' })
        await enqueueLinks({ strategy: 'same-domain', globs: ['**?page=*'], label: 'LIST' })
        return
      }

      await page.goto(request.url, { waitUntil: 'domcontentloaded' })
      // Robust delay
      await delay(2000 + Math.random() * 3000)
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { })

      const sourceId = extractSourceIdFromUrl(request.url)
      const base = { source: 'ssense', sourceId, canonicalUrl: request.url }

      const ldRaw = await page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.map((n) => n.textContent || '').join('\n')).catch(() => '')
      let extracted = fromJsonLd(ldRaw)

      // Robust DOM Parsing
      const domBrand = (await page.$eval('[data-testid="pdp-brand"], [id="pdpBrandNameText"], [itemprop="brand"]', el => el.textContent?.trim()).catch(() => '')) ||
        (await page.$eval('h1 a', el => el.textContent?.trim()).catch(() => '')) || '';

      let domName = (await page.$eval('[data-testid="pdp-title"], [id="pdpProductNameText"], [itemprop="name"]', el => el.textContent?.trim()).catch(() => '')) ||
        (await page.$eval('h1', el => el.textContent?.trim()).catch(() => '')) || '';

      // Clean Title
      if (domBrand && domName.toLowerCase().startsWith(domBrand.toLowerCase())) {
        domName = domName.slice(domBrand.length).trim();
      }

      // Price Parsing
      const regularPrice = (await page.$eval('[data-testid="price-regular"]', el => el.textContent?.trim()).catch(() => '')) || '';
      const salePrice = (await page.$eval('[data-testid="price-sale"]', el => el.textContent?.trim()).catch(() => '')) || '';
      const currentPrice = (await page.$eval('[data-testid="current-price"]', el => el.textContent?.trim()).catch(() => '')) || '';

      let finalPrice = { value: undefined, currency: 'USD' };
      const extractPrice = (str) => {
        const m = str.match(/([$€£])?\s?([\d,.]+)/);
        if (!m) return null;
        return {
          currency: ({ '$': 'USD', '€': 'EUR', '£': 'GBP' }[m[1] || '$'] || 'USD'),
          value: Number(m[2].replace(/[,.](?=\d{3}\b)/g, '').replace(',', '.'))
        };
      };

      const pSale = extractPrice(salePrice);
      const pReg = extractPrice(regularPrice);
      const pCurr = extractPrice(currentPrice);

      if (pSale) finalPrice = pSale;
      else if (pReg) finalPrice = pReg;
      else if (pCurr) finalPrice = pCurr;

      // Image Parsing
      const galleryImages = await page.$$eval(
        '[data-testid="pdp-gallery"] img, .image-container img',
        imgs => imgs.map(img => img.src || img.srcset?.split(' ')[0]).filter(src => src && !src.includes('placeholder'))
      ).catch(() => []);

      let domImgs = galleryImages;
      if (domImgs.length === 0) {
        domImgs = await page.$$eval('img', (els) => Array.from(new Set(els.map((e) => e.src || (e.srcset || '').split(' ')[0]))).filter(s => s.length > 50 && !s.includes('placeholder')));
      }
      domImgs = Array.from(new Set(domImgs));

      if (!extracted || !extracted.title || !extracted.images?.length) {
        extracted = {
          title: normalizeText(domName || extracted?.title),
          brand: normalizeText(domBrand || extracted?.brand),
          price: finalPrice.value ? finalPrice : (extracted?.price || { value: undefined, currency: 'USD' }),
          images: domImgs.length > 0 ? domImgs.map(normalizeImageUrl) : (extracted?.images || [])
        }
      } else {
        // Enhance existing extraction
        if (domImgs.length > extracted.images?.length) {
          extracted.images = domImgs.map(normalizeImageUrl);
        }
        if (domName && domName.length < extracted.title.length) {
          extracted.title = normalizeText(domName); // Prefer cleaner title
        }
      }

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
        if (out.data) extracted = { ...extracted, ...out.data }
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
      }

      // Final Title Cleaning (Strict)
      if (doc.title) {
        doc.title = doc.title.replace(/\|\s*SSENSE/i, '').replace(/\|\s*ssense/i, '').trim();
        if (doc.brand && doc.title.toLowerCase().startsWith(doc.brand.toLowerCase())) {
          doc.title = doc.title.slice(doc.brand.length).trim();
        }
        // Remove leading " - " or " | " if left over
        doc.title = doc.title.replace(/^[-|]\s+/, '');
      }
      await upsertProduct(doc)
      seen += 1
      if (seen >= maxItems) await crawler.teardown()
    },
  })

  await crawler.run()
  return { ok: true, insertedOrUpdated: seen, firecrawlUsed: firecrawl.used }
}

module.exports = { runSsense }
