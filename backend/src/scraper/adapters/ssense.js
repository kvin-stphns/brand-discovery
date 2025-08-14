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
      return route.abort().catch(() => {});
    }
    return route.continue().catch(() => {});
  });

  const productLinks = new Set();

  try {
    await page.goto(listingUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    // Give the client-side React a moment
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

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
          page.click(nextSel).catch(() => {}),
          page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {}),
        ]);
        pagesSeen += 1;
        await delay(350 + Math.random() * 450);
        continue;
      }

      // Infinite scroll fallback
      const before = productLinks.size;
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(900);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

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
    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Name / brand
    const nameSel = ['h1', 'h2', '[data-testid="pdp-title"]', '[itemprop="name"]'].join(',');
    data.name = (await page.$eval(nameSel, (el) => el.textContent?.trim()).catch(() => '')) || data.name;

    const brandSel = [
      '[itemprop="brand"]',
      'a[data-testid="brand-link"]',
      'a[href*="/men/designers/"]',
      'a[href*="/women/designers/"]',
      'a[aria-label*="Designer"]',
    ].join(',');
    data.brand = (await page.$eval(brandSel, (el) => el.textContent?.trim()).catch(() => '')) || data.brand;

    // Price (regular/sale)
    const priceText = (await page.$eval(
      [
        '[data-testid="price-regular"]',
        '[data-testid="price-sale"]',
        '[itemprop="price"]',
        '[data-testid="current-price"]',
        '[class*="Price"]',
      ].join(','),
      (el) => el.textContent?.trim()
    ).catch(() => '')) || '';

    const origText = (await page.$eval(
      ['[data-testid="original-price"]', '[data-testid="was-price"]', '[class*="WasPrice"]'].join(','),
      (el) => el.textContent?.trim()
    ).catch(() => '')) || '';

    const priceMatch = priceText.match(/([\$€£])?\s?(\d[\d.,]*)/);
    const origMatch = origText.match(/([\$€£])?\s?(\d[\d.,]*)/);
    const currFrom = (sym) => ({ '$': 'USD', '€': 'EUR', '£': 'GBP' }[sym || '$'] || 'USD');

    data.price.value = priceMatch ? Number(priceMatch[2].replace(/[,.](?=\d{3}\b)/g, '').replace(',', '.')) : undefined;
    data.price.currency = priceMatch ? currFrom(priceMatch[1]) : 'USD';
    data.price.originalValue = origMatch ? Number(origMatch[2].replace(/[,.](?=\d{3}\b)/g, '').replace(',', '.')) : undefined;

    // Images (gallery)
    const imgUrls = await page.$$eval(
      'img[src], img[srcset]',
      (imgs) =>
        Array.from(
          new Set(
            imgs
              .map((img) => img.src || (img.srcset || '').split(' ')[0])
              .filter((u) => /^https?:\/\//i.test(u))
          )
        )
    ).catch(() => []);
    data.media = imgUrls;

    // Description
    const descSel = [
      '[data-testid="product-description"]',
      '[itemprop="description"]',
      'section[aria-label*="Description"]',
      '[class*="Description"]',
    ].join(',');
    data.description = (await page.$eval(descSel, (el) => el.textContent?.trim()).catch(() => '')) || '';

    // Details/specs
    data.details = (await page.$$eval(
      'ul[role="list"] li, [data-testid="product-details"] li, .ProductDetails__List li, [class*="Details"] li',
      (lis) => lis.map((li) => li.textContent?.trim()).filter(Boolean)
    ).catch(() => [])) || [];

    // Sizes with availability
    data.sizes = (await page.$$eval(
      [
        '[data-testid="size-selector"] button',
        '[aria-label*="Size"] button',
        'button[data-size]',
        '[data-testid="SizeButton"]',
        'button[aria-pressed][class*="Size"]',
      ].join(','),
      (btns) =>
        btns
          .map((b) => ({
            label: b.textContent?.trim(),
            available: !b.getAttribute('disabled') && b.getAttribute('aria-pressed') !== 'false',
          }))
          .filter((s) => s.label)
    ).catch(() => [])) || [];

    // Shipping/returns (best-effort)
    const shipSel = [
      '[data-testid="shipping-info"]',
      '[data-testid="returns-info"]',
      '[aria-label*="Shipping"]',
      '[aria-label*="Return"]',
      '[class*="Shipping"]',
      '[class*="Returns"]',
    ].join(',');
    data.shipping = (await page.$eval(shipSel, (el) => el.textContent?.trim()).catch(() => '')) || '';

    // Category/gender (breadcrumbs or URL)
    const breadcrumb = await page.$$eval(
      'nav[aria-label="breadcrumb"] a, [data-testid="breadcrumbs"] a, nav[aria-label*="Breadcrumbs"] a',
      (as) => as.map((a) => a.textContent?.trim()).filter(Boolean)
    ).catch(() => []);
    if (breadcrumb?.length) {
      data.category = breadcrumb.slice(-1)[0];
      if (/women/i.test(breadcrumb.join(' '))) data.gender = 'women';
      if (/men/i.test(breadcrumb.join(' '))) data.gender = 'men';
    } else {
      if (/women/i.test(productUrl)) data.gender = 'women';
      if (/men/i.test(productUrl)) data.gender = 'men';
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
            await delay(250 + Math.random() * 300);
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
