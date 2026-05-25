/* eslint-disable no-console */
const { chromium } = require('playwright');
const { Product } = require('../../../models/productModel');
const { normalizeProduct } = require('../../feeds/normalizeProduct');

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
  const normalized = normalizeProduct(p, { source: p.source });
  if (!normalized.valid) {
    throw new Error(`Rejected low-quality scraped product: ${normalized.issues.join(', ')}`);
  }
  const product = normalized.product;
  await Product.updateOne(
    { source: product.source, sourceId: product.sourceId },
    { $set: product, $setOnInsert: { createdAt: new Date() } },
    { upsert: true, runValidators: true }
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
          page.click(nextSel).catch(() => { }),
          page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => { }),
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
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // Small random delay to mimic human behavior
    await delay(1000 + Math.random() * 2000);

    // --- Brand & Name ---
    // Farfetch often puts Brand in a specific element and Description (Name) in another
    data.brand = (await page.$eval('[data-testid="brand-name"], [data-tstid="brandName"]', el => el.textContent?.trim()).catch(() => '')) || '';

    // The "short description" is usually the clean product name (e.g. "Logo T-Shirt")
    data.name = (await page.$eval('[data-testid="product-short-description"], [data-tstid="cardShortDescription"]', el => el.textContent?.trim()).catch(() => '')) || '';

    // Fallback if specific selectors fail
    if (!data.brand) {
      data.brand = (await page.$eval('h1 a, [data-component="BrandName"]', el => el.textContent?.trim()).catch(() => '')) || '';
    }
    if (!data.name) {
      data.name = (await page.$eval('h1, h2', el => el.textContent?.trim()).catch(() => '')) || '';
      // If name includes brand, strip it (basic heuristic)
      if (data.brand && data.name.toLowerCase().startsWith(data.brand.toLowerCase())) {
        data.name = data.name.slice(data.brand.length).trim();
      }
    }

    // --- Price ---
    // Look for the "final" price and "original" price
    const priceText = (await page.$eval('[data-testid="price"], [data-tstid="priceInfo-original"]', el => el.textContent?.trim()).catch(() => '')) || '';
    const saleText = (await page.$eval('[data-testid="sale-price"]', el => el.textContent?.trim()).catch(() => '')) || '';

    // If there's a sale price, that's the current value. The "price" element might be the original.
    // Farfetch DOM varies. Sometimes "price" is the current price.
    // Strategy: Grab all price-like strings and sort them.

    const extractPrice = (str) => {
      const m = str.match(/([$€£])?\s?([\d,.]+)/);
      if (!m) return null;
      return {
        currency: ({ '$': 'USD', '€': 'EUR', '£': 'GBP' }[m[1] || '$'] || 'USD'),
        value: Number(m[2].replace(/[,.](?=\d{3}\b)/g, '').replace(',', '.'))
      };
    };

    const p1 = extractPrice(saleText);
    const p2 = extractPrice(priceText);

    if (p1 && p2) {
      // Sale exists
      data.price.value = p1.value;
      data.price.currency = p1.currency;
      data.price.originalValue = p2.value;
    } else if (p2) {
      // Only one price found
      data.price.value = p2.value;
      data.price.currency = p2.currency;
    }

    // --- Images ---
    // Get all images in the gallery container to avoid footer/recommendation images
    const galleryImages = await page.$$eval(
      '[data-testid="product-gallery"] img, [data-testid="gallery-image"]',
      imgs => imgs.map(img => img.src || img.srcset?.split(' ')[0]).filter(src => src && !src.includes('placeholder') && !src.includes('blank'))
    ).catch(() => []);

    // Fallback to all large images if gallery selector fails
    if (galleryImages.length === 0) {
      const allImages = await page.$$eval('img', imgs =>
        imgs
          .filter(img => img.naturalWidth > 400 || (img.width > 400)) // Filter for decent size
          .map(img => img.src)
      );
      data.media = Array.from(new Set(allImages));
    } else {
      data.media = Array.from(new Set(galleryImages));
    }

    // --- Description & Details ---
    data.description = (await page.$eval('[data-testid="product-description"]', el => el.textContent?.trim()).catch(() => '')) || '';

    data.details = await page.$$eval(
      '[data-testid="product-attributes"] li, [data-testid="product-composition"] li',
      lis => lis.map(li => li.textContent?.trim()).filter(Boolean)
    ).catch(() => []);

    // --- Sizes ---
    data.sizes = await page.$$eval(
      '[data-testid="size-selector"] div[role="button"]', // Farfetch often uses divs for sizes
      btns => btns.map(b => ({
        label: b.textContent?.trim(),
        available: !b.getAttribute('aria-disabled')
      })).filter(s => s.label)
    ).catch(() => []);

    // --- Category/Gender ---
    // Infer from URL or Breadcrumbs
    if (productUrl.includes('/men/')) data.gender = 'men';
    else if (productUrl.includes('/women/')) data.gender = 'women';

    const breadcrumbs = await page.$$eval('[data-testid="breadcrumb"] a', as => as.map(a => a.textContent?.trim()));
    if (breadcrumbs.length > 0) {
      data.category = breadcrumbs[breadcrumbs.length - 1]; // Last breadcrumb is usually category
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
            // Robust delay: 2-5 seconds to avoid 429
            await delay(2000 + Math.random() * 3000);
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
