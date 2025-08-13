const cheerio = require('cheerio')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

async function ssense() {
  const url = 'https://www.ssense.com/en-us/men'
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = await res.text()
    const $ = cheerio.load(html)
    const items = []
    $('img').slice(0, 20).each((_i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || ''
      if (src) items.push({ name: 'SSENSE Item', images: [src], price: undefined, currency: 'USD', url })
    })
    await sleep(500)
    return items
  } catch (e) {
    return []
  }
}

module.exports = { ssense }