/* eslint-disable no-console */
const { chromium } = require('playwright');
const { Product } = require('../../../models/productModel');

async function getPLimit() {
  const m = await import('p-limit');
  return m.default || m;
}

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

function externalIdFromUrl(url) {
  // Farfetch URLs often contain a numeric id at the end or as a query param
  // e.g. /shopping/men/product-12345678.aspx or ?storeid=9359&cod=20468876
  const m = url.match(/(?:product|item)[-/](\d{6,})/i) || url.match(/(?:cod|id)=(\d{6,})/i);
  return m ? m[1] : url;
}

async function upsertProduct(p) {
  // Upsert by source + externalId for dedupe
  await Product.updateOne(
    { source: p.source, externalId: p.externalId },
    { $set: p },
    { upsert: true }
  );
}

function slugifySafe(str, fallback) {
  const s = String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return s || String(fallback || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function parseListing(listingUrl, browser) {
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
  });
  const page = await ctx.newPage();
  const productLinks = new Set();

  try {
    await page.goto(listingUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });

    // Try both classic pagination and infinite scroll
    let pagesSeen = 0;
    while (pagesSeen < (Number(process.env.SCRAPE_MAX_PAGES) || 40)) {
      // Collect product card links
      const newLinks = await page.$$eval(
        'a[data-testid="productCard-link"], a[data-component^="ProductCard"], a[aria-label*="product"]',
        (as) => Array.from(new Set(as.map((a) => a.href))).filter(Boolean)
      );
      newLinks.forEach((l) => productLinks.add(l));

      // Try to find a "next" button
      const nextSel =
        'a[rel="next"], button[aria-label="Next"], a[aria-label="Next"], button[data-testid="pagination-next"]';
      const hasNext = await page.$(nextSel);

      if (hasNext) {
        await Promise.all([
          page.click(nextSel).catch(() => {}),
          page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {}),
        ]);
        pagesSeen += 1;
        await delay(300 + Math.random() * 400);
        continue;
      }

      // If no explicit next, try infinite scroll
      const before = productLinks.size;
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(800);
      const afterLinks = await page.$$eval(
        'a[data-testid="productCard-link"], a[data-component^="ProductCard"], a[aria-label*="product"]',
        (as) => Array.from(new Set(as.map((a) => a.href))).filter(Boolean)
      );
      afterLinks.forEach((l) => productLinks.add(l));
      const after = productLinks.size;

      if (after === before) {
        // no more
        break;
      }

      pagesSeen += 1;
      await delay(300 + Math.random() * 400);
    }
  } catch (e) {
    console.warn('[farfetch:list] failed', listingUrl, e.message);
  } finally {
    await ctx.close();
  }

  return Array.from(productLinks);
}

async function parseProduct(productUrl, browser) {
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
  });
  const page = await ctx.newPage();

  const data = {
    source: 'farfetch',
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

    // Name / brand / price
    data.name =
      (await page.$eval('h1, h2', (el) => el.textContent?.trim()).catch(() => '')) || data.name;

    data.brand =
      (await page
        .$eval('[data-qa="product-brand"], [data-testid="brand-name"], ._e0afba', (el) =>
          el.textContent?.trim()
        )
        .catch(() => '')) || data.brand;

    const priceText =
      (await page
        .$eval('[data-qa="price"], [itemprop="price"], [data-testid="price"]', (el) =>
          el.textContent?.trim()
        )
        .catch(() => '')) || '';

    const origText =
      (await page
        .$eval('[data-testid="original-price"], [data-qa="was-price"]', (el) => el.textContent?.trim())
        .catch(() => '')) || '';

    const priceMatch = priceText.match(/([\$€£])?\s?(\d[\d.,]*)/);
    const origMatch = origText.match(/([\$€£])?\s?(\d[\d.,]*)/);
    const currFrom = (sym) => ({ '$': 'USD', '€': 'EUR', '£': 'GBP' }[sym || '$'] || 'USD');

    data.price.value = priceMatch ? Number(priceMatch[2].replace(/[,.](?=\d{3}\b)/g, '').replace(',', '.')) : undefined;
    data.price.currency = priceMatch ? currFrom(priceMatch[1]) : 'USD';
    data.price.originalValue = origMatch
      ? Number(origMatch[2].replace(/[,.](?=\d{3}\b)/g, '').replace(',', '.'))
      : undefined;

    // Images (primary + gallery)
    const imgUrls = await page
      .$$eval(
        'img[src], img[srcset]',
        (imgs) =>
          Array.from(
            new Set(
              imgs
                .map((img) => img.src || (img.srcset || '').split(' ')[0])
                .filter((u) => /^https?:\/\//i.test(u))
                .filter((u) => /\.(jpg|jpeg|png|webp)(?:\?.*)?$/i.test(u))
                .filter((u) => !/bat\.bing\.com|doubleclick|analytics|pixel\./i.test(u))
            )
          )
      )
      .catch(() => []);
    data.media = imgUrls;

    // Description & details
    data.description =
      (await page
        .$eval(
          '[data-qa="product-description"], [data-testid="product-description"], section[aria-label*="Description"]',
          (el) => el.textContent?.trim()
        )
        .catch(() => '')) || '';

    const details = await page
      .$$eval(
        'ul[role="list"] li, .product-details li, [data-testid="product-details"] li',
        (lis) => lis.map((li) => li.textContent?.trim()).filter(Boolean)
      )
      .catch(() => []);
    data.details = details;

    // Sizes
    const sizes = await page
      .$$eval(
        '[data-testid="size-selector"] button, [aria-label*="Size"] button, button[data-size]',
        (btns) =>
          btns
            .map((b) => ({
              label: b.textContent?.trim(),
              available: !b.getAttribute('disabled'),
            }))
            .filter((s) => s.label)
      )
      .catch(() => []);
    data.sizes = sizes;

    // Shipping/returns (best-effort)
    data.shipping =
      (await page
        .$eval(
          '[data-testid="shipping-info"], [data-qa="shipping"], [aria-label*="Shipping"]',
          (el) => el.textContent?.trim()
        )
        .catch(() => '')) || '';

    // Category / gender (best-effort via breadcrumbs or URL)
    const breadcrumb = await page
      .$$eval('nav[aria-label="breadcrumb"] a, [data-testid="breadcrumbs"] a', (as) =>
        as.map((a) => a.textContent?.trim()).filter(Boolean)
      )
      .catch(() => []);
    if (breadcrumb?.length) {
      data.category = breadcrumb.slice(-1)[0];
      if (/women/i.test(breadcrumb.join(' '))) data.gender = 'women';
      if (/men/i.test(breadcrumb.join(' '))) data.gender = 'men';
    } else {
      if (/women/i.test(productUrl)) data.gender = 'women';
      if (/men/i.test(productUrl)) data.gender = 'men';
    }
  } catch (e) {
    console.warn('[farfetch:product] failed', productUrl, e.message);
  } finally {
    await ctx.close();
  }

  return data;
}

async function scrapeFarfetch({
  seedUrls = [
    // broaden coverage (men & women)
    'https://www.farfetch.com/shopping/men/items.aspx',
    'https://www.farfetch.com/shopping/women/items.aspx',
    'https://www.farfetch.com/shopping/men/shoes-2/items.aspx',
    'https://www.farfetch.com/shopping/women/bags-purses-90/items.aspx',
  ],
  productUrls,
  maxItems = Number(process.env.SCRAPE_MAX_PRODUCTS) || 3000,
  listConcurrency = Number(process.env.LIST_CONCURRENCY) || 4,
  productConcurrency = Number(process.env.PRODUCT_CONCURRENCY) || 10,
} = {}) {
  const browser = await chromium.launch({ headless: String(process.env.HEADLESS || 'true') !== 'false' });

  try {
    // Load p-limit once and reuse
    const pLimit = await getPLimit();

    let links = [];
    if (Array.isArray(productUrls) && productUrls.length) {
      links = productUrls;
    } else {
      // gather links from multiple listing pages
      const limits = pLimit(listConcurrency);
      const sets = await Promise.all(
        seedUrls.map((u) => limits(() => parseListing(u, browser)))
      );
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
            // Skip rate-limit or bad pages
            if (!p || /429\s+Too\s+Many\s+Requests/i.test(p.name || '') || !Array.isArray(p.media) || p.media.length === 0) {
              return
            }
            // Attach required fields
            const record = {
              source: 'farfetch',
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
            console.warn('[farfetch] product scrape failed', link, e.message);
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

// Backward export names for compatibility
module.exports = { scrapeFarfetch, farfetch: scrapeFarfetch };
