#!/usr/bin/env node
/* eslint-disable no-console */
require('dotenv').config()
const { connectToDatabase } = require('../../utils/db')
const { runFarfetch } = require('./farfetch')
const { runSsense } = require('./ssense')

function arg(key, dflt) {
  const v = process.argv.find((a) => a.startsWith(`--${key}=`))
  return v ? v.split('=')[1] : dflt
}

async function main() {
  await connectToDatabase().catch(() => {})
  const only = arg('only', '')
  const max = Number(arg('max', process.env.SCRAPE_MAX_PRODUCTS || 1000))
  const pages = Number(arg('pages', process.env.SCRAPE_MAX_PAGES || 120))

  const out = { ok: true }
  const started = Date.now()
  if (!only || only === 'farfetch') out.farfetch = await runFarfetch({ maxItems: max, maxPages: pages })
  if (!only || only === 'ssense') out.ssense = await runSsense({ maxItems: max })
  out.tookMs = Date.now() - started
  console.log(JSON.stringify(out))
}

main().catch((e) => {
  console.error('[scrape] fatal:', e)
  process.exit(1)
})

