/* eslint-disable no-console */
const { chromium, devices } = require('playwright');
const { Product } = require('../../../models/productModel');

async function getPLimit() {
  const m = await import('p-limit');
  return m.default || m;
}

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

function externalIdFromUrl(url) {
  const m = url.match(/\/(\d{6,})(?:[?#]|$)/);
  return m ? m[1] : url;
}

function slugifySafe(str, fallback) {
  const s = String(str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return s || String(fallback || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function upsertProduct(p) {
  await Product.updateOne(
    { source: p.source, externalId: p.externalId },
    { $set: p },
    { upsert: true }
  );
}

const uaPool = [
  devices['Desktop Chrome'].userAgent,
  // Some variety but still desktop-like
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

async function newCtx(browser) {
  const ua = uaPool[Math.floor(Math.random() * uaPool.length)];
  const ctx = await browser.newContext({
    userAgent: ua,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    viewport: { width: 1366, height: 900 },
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Mode': 'navigate',
    },
  });
  return ctx;
}

async function parseListing(listingUrl, browser) {
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();

  // Block heavy assets on listing pages to speed up and reduce bot signals
  await page.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (type === 'image' || type === 'font' || type === 'media' || type === 'stylesheet') {
      return route.abort().catch(() => { });
    }
    return route.continue().catch(() => { });
  });

  const productLinks = new Set();

  try {
    await page.goto(listingUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    // Give the client-side React a moment
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });

    let pagesSeen = 0;
    while (pagesSeen < (Number(process.env.SCRAPE_MAX_PAGES) || 40)) {
      const selectorCandidates = [
        'a[href*="/product/"]',
        'a[data-testid="product-link"]',
        'a[data-testid^="ProductCard"]',
        'a[aria-label*="product"]',
        'a[href^="/en-us/men/product/"]',
        'a[href^="/en-us/women/product/"]',
      ];

      const newLinks = await page.$$eval(
        selectorCandidates.join(','),
        (as) => Array.from(new Set(as.map((a) => a.href))).filter(Boolean)
      ).catch(() => []);
      newLinks.forEach((l) => productLinks.add(l));

      // Try explicit next
      const nextSel = 'a[rel="next"], button[aria-label="Next"], a[aria-label="Next"]';
      const hasNext = await page.$(nextSel);

      if (hasNext) {
        await Promise.all([
          page.click(nextSel).catch(() => { }),
          page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => { }),
        ]);
        pagesSeen += 1;
        await delay(350 + Math.random() * 450);
        continue;
      }

      // Infinite scroll fallback
      const before = productLinks.size;
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(900);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });

      const afterLinks = await page.$$eval(
        selectorCandidates.join(','),
        (as) => Array.from(new Set(as.map((a) => a.href))).filter(Boolean)
      ).catch(() => []);
      afterLinks.forEach((l) => productLinks.add(l));

      if (productLinks.size === before) break;

      pagesSeen += 1;
      await delay(350 + Math.random() * 450);
    }
  } catch (e) {
    console.warn('[ssense:list] failed', listingUrl, e.message);
  } finally {
    await ctx.close();
  }

  return Array.from(productLinks);
}

async function parseProduct(productUrl, browser) {
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();

  const data = {
    source: 'ssense',
    externalId: externalIdFromUrl(productUrl),
    url: productUrl,
    name: '',
    brand: '',
    price: { value: undefined, currency: 'USD', originalValue: undefined },
    media: [],
    description: '',
    details: [],
    sizes: [],
    shipping: '',
    category: '',
    gender: '',
    updatedAt: new Date(),
  };

  try {
    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(1000 + Math.random() * 2000); // Human delay

    // --- Brand & Name ---
    data.brand = (await page.$eval('[data-testid="pdp-brand"], [id="pdpBrandNameText"]', el => el.textContent?.trim()).catch(() => '')) || '';
    data.name = (await page.$eval('[data-testid="pdp-title"], [id="pdpProductNameText"]', el => el.textContent?.trim()).catch(() => '')) || '';

    // Fallback
    if (!data.brand) {
      data.brand = (await page.$eval('h1 a', el => el.textContent?.trim()).catch(() => '')) || '';
    }
    if (!data.name) {
      data.name = (await page.$eval('h1', el => el.textContent?.trim()).catch(() => '')) || '';
      // Strip brand if present
      if (data.brand && data.name.toLowerCase().startsWith(data.brand.toLowerCase())) {
        data.name = data.name.slice(data.brand.length).trim();
      }
    }

    // --- Price ---
    const regularPrice = (await page.$eval('[data-testid="price-regular"]', el => el.textContent?.trim()).catch(() => '')) || '';
    const salePrice = (await page.$eval('[data-testid="price-sale"]', el => el.textContent?.trim()).catch(() => '')) || '';

    // Fallback for older DOM
    const currentPrice = (await page.$eval('[data-testid="current-price"]', el => el.textContent?.trim()).catch(() => '')) || '';

    const extractPrice = (str) => {
      const m = str.match(/([$€£])?\s?([\d,.]+)/);
      if (!m) return null;
      return {
        currency: ({ '$': 'USD', '€': 'EUR', '£': 'GBP' }[m[1] || '$'] || 'USD'),
        value: Number(m[2].replace(/[,.](?=\d{3}\b)/g, '').replace(',', '.'))
      };
    };

    const pReg = extractPrice(regularPrice);
    const pSale = extractPrice(salePrice);
    const pCurr = extractPrice(currentPrice);

    if (pSale && pReg) {
      data.price.value = pSale.value;
      data.price.currency = pSale.currency;
      data.price.originalValue = pReg.value;
    } else if (pReg) {
      data.price.value = pReg.value;
      data.price.currency = pReg.currency;
    } else if (pCurr) {
      data.price.value = pCurr.value;
      data.price.currency = pCurr.currency;
    }

    // --- Images ---
    // SSENSE gallery usually has high-res images
    const galleryImages = await page.$$eval(
      '[data-testid="pdp-gallery"] img, .image-container img',
      imgs => imgs.map(img => img.src || img.srcset?.split(' ')[0]).filter(src => src && !src.includes('placeholder'))
    ).catch(() => []);

    if (galleryImages.length > 0) {
      data.media = Array.from(new Set(galleryImages));
    } else {
      // Fallback
      const allImages = await page.$$eval('img', imgs =>
        imgs
          .filter(img => img.naturalWidth > 400)
          .map(img => img.src)
      );
      data.media = Array.from(new Set(allImages));
    }

    // --- Description & Details ---
    data.description = (await page.$eval('[data-testid="product-description"]', el => el.textContent?.trim()).catch(() => '')) || '';

    data.details = await page.$$eval(
      '[data-testid="product-details"] li',
      lis => lis.map(li => li.textContent?.trim()).filter(Boolean)
    ).catch(() => []);

    // --- Sizes ---
    data.sizes = await page.$$eval(
      '[data-testid="size-selector"] option, [data-testid="size-selector"] li',
      els => els.map(el => ({
        label: el.textContent?.trim(),
        available: !el.disabled && !el.getAttribute('aria-disabled')
      })).filter(s => s.label && s.label !== 'Select size')
    ).catch(() => []);

    // --- Category/Gender ---
    if (productUrl.includes('/men/')) data.gender = 'men';
    else if (productUrl.includes('/women/')) data.gender = 'women';

    const breadcrumbs = await page.$$eval('[data-testid="breadcrumbs"] a', as => as.map(a => a.textContent?.trim()));
    if (breadcrumbs.length > 0) {
      data.category = breadcrumbs[breadcrumbs.length - 1];
    }

  } catch (e) {
    console.warn('[ssense:product] failed', productUrl, e.message);
  } finally {
    await ctx.close();
  }

  return data;
}

async function scrapeSsense({
  seedUrls = [
    // Men core
    'https://www.ssense.com/en-us/men/new-arrivals',
    'https://www.ssense.com/en-us/men/clothing',
    'https://www.ssense.com/en-us/men/shoes',
    'https://www.ssense.com/en-us/men/bags',
    'https://www.ssense.com/en-us/men/accessories',
    'https://www.ssense.com/en-us/men/jewelry',
    // Women core
    'https://www.ssense.com/en-us/women/new-arrivals',
    'https://www.ssense.com/en-us/women/clothing',
    'https://www.ssense.com/en-us/women/shoes',
    'https://www.ssense.com/en-us/women/bags',
    'https://www.ssense.com/en-us/women/accessories',
    'https://www.ssense.com/en-us/women/jewelry',
    // Popular subcats
    'https://www.ssense.com/en-us/men/sneakers',
    'https://www.ssense.com/en-us/women/sneakers',
    'https://www.ssense.com/en-us/men/tops',
    'https://www.ssense.com/en-us/women/tops',
    'https://www.ssense.com/en-us/men/outerwear',
    'https://www.ssense.com/en-us/women/outerwear',
    'https://www.ssense.com/en-us/men/pants',
    'https://www.ssense.com/en-us/women/pants',
    'https://www.ssense.com/en-us/men/dresses', // ok if sparse
    'https://www.ssense.com/en-us/women/dresses',
  ],
  productUrls,
  maxItems = Number(process.env.SCRAPE_MAX_PRODUCTS) || 3000,
  listConcurrency = Number(process.env.LIST_CONCURRENCY) || 4,
  productConcurrency = Number(process.env.PRODUCT_CONCURRENCY) || 10,
} = {}) {
  const browser = await chromium.launch({ headless: String(process.env.HEADLESS || 'true') !== 'false' });

  try {
    const pLimit = await getPLimit();

    let links = [];
    if (Array.isArray(productUrls) && productUrls.length) {
      links = productUrls;
    } else {
      const limits = pLimit(listConcurrency);
      const sets = await Promise.all(seedUrls.map((u) => limits(() => parseListing(u, browser))));
      links = Array.from(new Set(sets.flat()));
    }

    if (maxItems && links.length > maxItems) {
      links = links.slice(0, maxItems);
    }

    const limit = pLimit(productConcurrency);
    let success = 0;

    await Promise.all(
      links.map((link) =>
        limit(async () => {
          try {
            const p = await parseProduct(link, browser);
            const record = {
              source: 'ssense',
              externalId: p.externalId || externalIdFromUrl(link),
              url: link,
              name: p.name,
              brand: p.brand,
              slug: slugifySafe(`${p.brand || ''} ${p.name || ''}`, p.externalId || externalIdFromUrl(link)),
              price: p.price,
              media: p.media,
              description: p.description,
              details: p.details,
              sizes: p.sizes,
              shipping: p.shipping,
              category: p.category,
              gender: p.gender,
              updatedAt: new Date(),
            };
            await upsertProduct(record);
            success++;
            await upsertProduct(record);
            success++;
            // Robust delay: 2-5 seconds
            await delay(2000 + Math.random() * 3000);
          } catch (e) {
            console.warn('[ssense] product scrape failed', link, e.message);
            await delay(400 + Math.random() * 400);
          }
        })
      )
    );

    return { success, total: links.length };
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeSsense, ssense: scrapeSsense };
