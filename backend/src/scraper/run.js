#!/usr/bin/env node
/* eslint-disable no-console */
require('dotenv').config();

const { connectToDatabase } = require('../../utils/db');

// Load adapters and normalize export names
const farfetchMod = require('./adapters/farfetch');
const ssenseMod = require('./adapters/ssense');
const scrapeFarfetch = farfetchMod.scrapeFarfetch || farfetchMod.farfetch;
const scrapeSsense = ssenseMod.scrapeSsense || ssenseMod.ssense;

function parseArgs(argv) {
  const out = { only: null, max: null };
  for (const a of argv) {
    if (a.startsWith('--only=')) out.only = a.split('=')[1];
    if (a.startsWith('--max=')) out.max = Number(a.split('=')[1]);
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // High-volume defaults; allow overrides
  const maxItems =
    Number(process.env.SCRAPE_MAX_PRODUCTS) ||
    Number(process.env.SCRAPE_MAX) ||
    Number(args.max) ||
    3000;

  const ffUrls = (process.env.SCRAPE_URLS_FF || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const ssUrls = (process.env.SCRAPE_URLS_SS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  await connectToDatabase();

  const start = Date.now();
  let ff = { success: 0, total: 0 };
  let ss = { success: 0, total: 0 };

  if (!args.only || args.only === 'farfetch') {
    ff = await scrapeFarfetch({
      maxItems,
      productUrls: ffUrls.length ? ffUrls : undefined,
    }).catch(e => {
      console.warn('[scrape:farfetch] failed:', e?.message || e);
      return { success: 0, total: 0, error: true };
    });
  }

  if (!args.only || args.only === 'ssense') {
    ss = await scrapeSsense({
      maxItems,
      productUrls: ssUrls.length ? ssUrls : undefined,
    }).catch(e => {
      console.warn('[scrape:ssense] failed:', e?.message || e);
      return { success: 0, total: 0, error: true };
    });
  }

  const tookMs = Date.now() - start;
  console.log(JSON.stringify({ ok: true, tookMs, maxItems, farfetch: ff, ssense: ss }));
  process.exit(0);
}

main().catch(e => {
  console.error('[scrape] fatal:', e);
  process.exit(1);
});
