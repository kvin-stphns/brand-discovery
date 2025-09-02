#!/usr/bin/env node
/* eslint-disable no-console */
require('dotenv').config();

const mongoose = require('mongoose');
const { connectToDatabase, disconnectFromDatabase } = require('../utils/db');

async function ensureIndex(coll, spec, options = {}) {
  const name = options.name || Object.entries(spec).map(([k, v]) => `${k}_${v}`).join('_');
  const existing = await coll.indexes();
  const found = existing.find((i) => i.name === name);
  if (found) return { created: false, name };
  await coll.createIndex(spec, { ...options, name });
  return { created: true, name };
}

async function dropIndexIfExists(coll, name) {
  const existing = await coll.indexes();
  const found = existing.find((i) => i.name === name);
  if (!found) return { dropped: false, name };
  await coll.dropIndex(name).catch((e) => {
    if (String(e.message || '').includes('index not found')) return; // idempotent
    throw e;
  });
  return { dropped: true, name };
}

async function run() {
  await connectToDatabase();
  const db = mongoose.connection.db;
  const coll = db.collection('products');

  const ops = [];

  // 1) Drop legacy unique indexes if present
  ops.push(await dropIndexIfExists(coll, 'url_1')); // legacy unique url index
  ops.push(await dropIndexIfExists(coll, 'name_1')); // legacy name index
  ops.push(await dropIndexIfExists(coll, 'externalId_1')); // legacy externalId index name (if any)
  ops.push(await dropIndexIfExists(coll, 'source_1_externalId_1')); // legacy compound unique

  // 2) Desired indexes
  ops.push(await ensureIndex(coll, { source: 1, sourceId: 1 }, { unique: true, name: 'source_1_sourceId_1' }));
  ops.push(await ensureIndex(coll, { slug: 1 }, { unique: false }));
  ops.push(await ensureIndex(coll, { brand: 1 }));
  ops.push(await ensureIndex(coll, { createdAt: -1 }));
  ops.push(await ensureIndex(coll, { 'price.value': 1 }));

  console.log(JSON.stringify({ ok: true, ops }));
  await disconnectFromDatabase();
}

run().catch((e) => {
  console.error('Migration failed', e);
  process.exit(1);
});

