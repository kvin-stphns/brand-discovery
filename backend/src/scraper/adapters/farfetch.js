<<<<<<< HEAD
const cheerio = require('cheerio')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

async function farfetch() {
  const url = 'https://www.farfetch.com'
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = await res.text()
    const $ = cheerio.load(html)
    const items = []
    $('img').slice(0, 20).each((_i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || ''
      if (src) items.push({ name: 'Farfetch Item', images: [src], price: undefined, currency: 'USD', url })
    })
    await sleep(500)
    return items
  } catch (e) {
    return []
  }
}

module.exports = { farfetch }
=======
const { chromium } = require('playwright')
const pLimit = require('p-limit').default || require('p-limit')
const { Product } = require('../../../models/productModel')

async function upsertProduct(p) {
  await Product.updateOne(
    { url: p.url },
    { $set: p },
    { upsert: true }
  )
}

function delay(ms) { return new Promise((r) => setTimeout(r, ms)) }

async function parseListing(pageUrl, browser) {
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' })
  const page = await ctx.newPage()
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 45000 })
  const items = await page.$$eval('a._5ce6b5, a[data-testid="productCard-link"]', (links) => {
    const hrefs = Array.from(links).map((a) => a.href)
    return Array.from(new Set(hrefs))
  })
  await ctx.close()
  return items
}

async function parseProduct(productUrl, browser) {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 45000 })
  const name = await page.$eval('h1, h2', (el) => el.textContent.trim())
  const brand = await page.$eval('[data-qa="product-brand"] , ._e0afba', (el) => el.textContent.trim()).catch(() => '')
  const priceText = await page.$eval('[data-qa="price"] , [itemprop="price"]', (el) => el.textContent.trim()).catch(() => '')
  const image = await page.$eval('img[srcset], img[src]', (img) => img.src || (img.srcset || '').split(' ')[0]).catch(() => '')
  await ctx.close()
  const priceMatch = priceText.match(/([\$€£])?\s?(\d+[\.,]?\d*)/)
  const price = priceMatch ? Number(priceMatch[2].replace(/,/g, '')) : undefined
  const currency = priceMatch ? ({ '$': 'USD', '€': 'EUR', '£': 'GBP' }[priceMatch[1]] || 'USD') : 'USD'
  return { name, brand, price, currency, image, url: productUrl, source: 'farfetch', tags: [] }
}

async function scrapeFarfetch({ seedUrls = ['https://www.farfetch.com/shopping/men/items.aspx'], productUrls, maxItems = 20, concurrency = 3 } = {}) {
  const browser = await chromium.launch({ headless: true })
  try {
    let productLinks = []
    if (Array.isArray(productUrls) && productUrls.length) {
      productLinks = productUrls
    } else {
      const listingUrls = seedUrls
      const productLinksSets = await Promise.all(listingUrls.map((u) => parseListing(u, browser)))
      productLinks = Array.from(new Set(productLinksSets.flat()))
    }
    productLinks = productLinks.slice(0, maxItems)

    const limit = pLimit(concurrency)
    let success = 0
    await Promise.all(
      productLinks.map((link) => limit(async () => {
        try {
          const p = await parseProduct(link, browser)
          await upsertProduct(p)
          success++
          await delay(200)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[farfetch] product scrape failed', link, e.message)
          await delay(400)
        }
      }))
    )
    return { success, total: productLinks.length }
  } finally {
    await browser.close()
  }
}

module.exports = { scrapeFarfetch }
>>>>>>> 6a9a98b (Add product scraping, database models, and MongoDB memory server support)
