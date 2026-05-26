#!/usr/bin/env node
/* eslint-disable no-console */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { connectToDatabase, disconnectFromDatabase } = require('../utils/db');
const { importProducts } = require('../src/feeds/importer');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const [key, ...rest] = arg.slice(2).split('=');
      if (rest.length) {
        args[key] = rest.join('=');
      } else if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
        args[key] = argv[i + 1];
        i += 1;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function parseCsv(text) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"' && next === '"') {
      current += '"';
      i += 1;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(current);
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      current = '';
    } else {
      current += ch;
    }
  }

  row.push(current);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  if (!rows.length) return [];

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const out = {};
    headers.forEach((header, idx) => {
      out[header] = cells[idx] === undefined ? '' : cells[idx].trim();
    });
    return out;
  });
}

function readRows(file, type) {
  const resolved = path.resolve(file);
  const raw = fs.readFileSync(resolved, 'utf8');
  const effectiveType = type || path.extname(resolved).slice(1).toLowerCase();
  if (effectiveType === 'json') {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return { rows: parsed, resolved, sourceType: 'manual-json' };
    if (Array.isArray(parsed.products)) return { rows: parsed.products, resolved, sourceType: parsed.sourceType || 'manual-json' };
    throw new Error('JSON feed must be an array or an object with a products array');
  }
  if (effectiveType === 'csv') {
    return { rows: parseCsv(raw), resolved, sourceType: 'manual-csv' };
  }
  throw new Error(`Unsupported feed type: ${effectiveType}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.file) {
    console.error('Usage: node scripts/import-feed.js --file=data/demo-feed/products.json --source=demo-json --type=json');
    process.exit(1);
  }

  const { rows, resolved, sourceType } = readRows(args.file, args.type);
  await connectToDatabase({ maxRetries: 1 });
  const result = await importProducts(rows, {
    source: args.source || 'manual-json',
    sourceType: args.sourceType || sourceType,
    filename: resolved,
    retailer: args.retailer,
    feedName: args.feedName,
  });
  console.log(JSON.stringify(result, null, 2));
  await disconnectFromDatabase();
}

main().catch(async (error) => {
  console.error(error);
  await disconnectFromDatabase().catch(() => {});
  process.exit(1);
});

module.exports = { parseCsv, readRows };
