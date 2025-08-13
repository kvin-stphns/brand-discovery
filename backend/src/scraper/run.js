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