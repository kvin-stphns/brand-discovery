<<<<<<< HEAD
#!/usr/bin/env node
require('dotenv').config()
const { ssense } = require('./adapters/ssense')
const { farfetch } = require('./adapters/farfetch')

async function main() {
  const arg = process.argv[2]
  const adapter = arg === 'farfetch' ? farfetch : ssense
  try {
    const items = await adapter()
    // eslint-disable-next-line no-console
    console.log(`Scraped ${items.length} items from ${arg || 'ssense'}`)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`[scrape:${arg || 'ssense'}] failed:`, e.message)
    process.exit(0)
  }
}

main()
=======
require('dotenv').config()
const { connectToDatabase } = require('../../utils/db')
const { scrapeFarfetch } = require('./adapters/farfetch')
const { scrapeSsense } = require('./adapters/ssense')

function parseArgs(argv) {
  const args = { only: null }
  argv.forEach((a) => {
    if (a.startsWith('--only=')) args.only = a.split('=')[1]
  })
  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  await connectToDatabase()
  const start = Date.now()
  const maxItems = Number(process.env.SCRAPE_MAX || 10)

  const ffFallback = (process.env.SCRAPE_URLS_FF || '').split(',').filter(Boolean)
  const ssFallback = (process.env.SCRAPE_URLS_SS || '').split(',').filter(Boolean)

  let ff = { success: 0, total: 0 }
  let ss = { success: 0, total: 0 }

  if (!args.only || args.only === 'farfetch') {
    ff = await scrapeFarfetch({ maxItems, productUrls: ffFallback.length ? ffFallback : undefined })
  }
  if (!args.only || args.only === 'ssense') {
    ss = await scrapeSsense({ maxItems, productUrls: ssFallback.length ? ssFallback : undefined })
  }

  const ms = Date.now() - start
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, tookMs: ms, farfetch: ff, ssense: ss }))
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
>>>>>>> 6a9a98b (Add product scraping, database models, and MongoDB memory server support)
