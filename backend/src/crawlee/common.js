const { Product } = require('../../models/productModel')
const fetch = require('node-fetch')

function normalizeText(s) {
  return String(s || '').replace(/\s+/g, ' ').trim()
}

function pickLargestFromSrcSet(srcset) {
  if (!srcset) return null
  const parts = String(srcset)
    .split(',')
    .map((p) => p.trim())
    .map((p) => {
      const [u, w] = p.split(' ')
      const width = Number((w || '').replace(/[^0-9]/g, '')) || 0
      return { u, width }
    })
  parts.sort((a, b) => b.width - a.width)
  return parts[0]?.u || null
}

function normalizeImageUrl(u) {
  try {
    const url = new URL(u)
    // strip common size params
    ;['wid', 'hei', 'w', 'h', 'size'].forEach((k) => url.searchParams.delete(k))
    return url.toString()
  } catch {
    return u
  }
}

function parsePrice(text) {
  if (!text) return { value: undefined, currency: 'USD' }
  const t = String(text)
  const m = t.match(/([\$€£])?\s?(\d[\d.,]*)/)
  const currFrom = (sym) => ({ '$': 'USD', '€': 'EUR', '£': 'GBP' }[sym || '$'] || 'USD')
  const value = m ? Number(m[2].replace(/[,.](?=\d{3}\b)/g, '').replace(',', '.')) : undefined
  const currency = m ? currFrom(m[1]) : 'USD'
  return { value, currency }
}

function fromJsonLd(raw) {
  try {
    const json = JSON.parse(raw)
    const items = Array.isArray(json) ? json : [json]
    const prod = items.find((o) => String(o['@type'] || o.type || '').toLowerCase().includes('product')) || items[0]
    if (!prod) return null
    const title = normalizeText(prod.name || prod.title || '')
    const brand = normalizeText(prod.brand?.name || prod.brand || '')
    const price = prod.offers?.price || prod.price
    const currency = prod.offers?.priceCurrency || prod.priceCurrency
    const images = Array.isArray(prod.image) ? prod.image : (prod.image ? [prod.image] : [])
    return {
      title,
      brand,
      price: price != null ? { value: Number(price), currency: currency || 'USD' } : undefined,
      images: images.map(normalizeImageUrl),
      description: prod.description ? String(prod.description) : undefined,
      sku: prod.sku || undefined,
    }
  } catch {
    return null
  }
}

function ensureArray(val) {
  if (!val) return []
  return Array.isArray(val) ? val : [val]
}

async function upsertProduct(doc) {
  if (!doc.source || !doc.sourceId) throw new Error('Missing source/sourceId for upsert')
  const update = {
    ...doc,
    updatedAt: new Date(),
  }
  await Product.updateOne({ source: doc.source, sourceId: doc.sourceId }, { $set: update, $setOnInsert: { createdAt: new Date() } }, { upsert: true })
}

async function firecrawlExtract(url, schema, { budget = 100, used = 0 } = {}) {
  const key = process.env.FIRECRAWL_API_KEY
  if (!key || used >= budget) return { used, data: null }
  const payload = {
    url,
    formats: ['extract'],
    extract: { schema },
  }
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(payload),
  }).catch(() => null)
  if (!res || !res.ok) return { used, data: null }
  const json = await res.json().catch(() => ({}))
  const data = json?.extract || json?.data || null
  return { used: used + 1, data }
}

module.exports = {
  normalizeText,
  pickLargestFromSrcSet,
  normalizeImageUrl,
  parsePrice,
  fromJsonLd,
  ensureArray,
  upsertProduct,
  firecrawlExtract,
}

