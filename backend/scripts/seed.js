#!/usr/bin/env node
/* eslint-disable no-console */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const { connectToDatabase, disconnectFromDatabase } = require('../utils/db');
const { Brand } = require('../models/brandModel');
const { Designer } = require('../models/designerModel');
const { Product } = require('../models/productModel');

const brandTypes = ['Streetwear', 'High Fashion', 'Avant Garde', 'Hybrid', 'Techwear', 'Workwear', 'Other'];
const productCategories = ['Tops', 'Bottoms', 'Outerwear', 'Accessories'];

function slugify(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function upsertBrand(name, idx, stats) {
  const slug = slugify(name);
  const exists = await Brand.exists({ slug });
  const update = {
    name,
    slug,
    image: `/placeholders/brand-${(idx % 4) + 1}.jpg`,
    tags: [brandTypes[idx % brandTypes.length]],
    location: 'Global',
    links: { website: `https://example.com/${slug}` },
  };
  const doc = await Brand.findOneAndUpdate({ slug }, update, { new: true, upsert: true, setDefaultsOnInsert: true });
  exists ? (stats.brandsUpdated++) : (stats.brandsCreated++);
  return doc;
}

async function upsertDesigner(name, idx, stats) {
  const slug = slugify(name);
  const exists = await Designer.exists({ slug });
  const update = {
    name,
    slug,
    image: `/placeholders/designer-${(idx % 4) + 1}.jpg`,
    url: `https://example.com/${slug}`,
  };
  const doc = await Designer.findOneAndUpdate({ slug }, update, { new: true, upsert: true, setDefaultsOnInsert: true });
  exists ? (stats.designersUpdated++) : (stats.designersCreated++);
  return doc;
}

async function upsertProduct(name, brandId, designerId, idx, stats) {
  const slug = slugify(name);
  const exists = await Product.exists({ slug });
  const update = {
    name,
    slug,
    brandId,
    designerId,
    media: [`/placeholders/product-${(idx % 4) + 1}.jpg`],
    images: [`/placeholders/product-${(idx % 4) + 1}.jpg`],
    price: { value: 100 + (idx % 10) * 25, currency: 'USD' },
    url: `https://example.com/product/${slug}`,
    tags: [productCategories[idx % productCategories.length]],
  };
  const doc = await Product.findOneAndUpdate({ slug }, update, { new: true, upsert: true, setDefaultsOnInsert: true });
  exists ? (stats.productsUpdated++) : (stats.productsCreated++);
  return doc;
}

async function seedFromSampleJSON() {
  const dataPath = path.join(__dirname, '..', 'utils', 'sample-products.json');
  const items = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, 'utf-8')) : [];
  let upserts = 0;

  for (const raw of items) {
    const p = { ...raw };

    // Normalize to new schema shape
    if (typeof p.price === 'number') {
      p.price = { value: p.price, currency: p.currency || 'USD' };
    } else if (p.price && typeof p.price === 'object') {
      p.price = {
        value: Number(p.price.value ?? p.value ?? 0),
        currency: p.price.currency || p.currency || 'USD',
        originalValue: p.price.originalValue != null ? Number(p.price.originalValue) : undefined,
      };
    } else {
      p.price = { value: undefined, currency: 'USD' };
    }

    if (!Array.isArray(p.media)) {
      // prefer images/media arrays if present
      if (Array.isArray(p.images)) p.media = p.images;
      else if (p.image) p.media = [p.image];
      else p.media = [];
    }

    // Upsert by URL if present, otherwise by {source, externalId}
    const query = p.url ? { url: p.url } : (p.source && p.externalId ? { source: p.source, externalId: p.externalId } : null);
    if (!query) continue;

    await Product.updateOne(query, { $set: p }, { upsert: true });
    upserts++;
  }

  console.log(JSON.stringify({ ok: true, mode: 'sample-json', upserts }));
}

async function seedGenerateDummies() {
  const stats = { brandsCreated: 0, brandsUpdated: 0, designersCreated: 0, designersUpdated: 0, productsCreated: 0, productsUpdated: 0 };

  const brands = [];
  for (let i = 1; i <= 20; i++) {
    // eslint-disable-next-line no-await-in-loop
    const b = await upsertBrand(`Brand ${i}`, i, stats);
    brands.push(b);
  }

  const designers = [];
  for (let i = 1; i <= 15; i++) {
    // eslint-disable-next-line no-await-in-loop
    const d = await upsertDesigner(`Designer ${i}`, i, stats);
    designers.push(d);
  }

  const totalProducts = 80;
  for (let i = 1; i <= totalProducts; i++) {
    const brand = brands[i % brands.length];
    const designer = designers[i % designers.length];
    // eslint-disable-next-line no-await-in-loop
    await upsertProduct(`Product ${i}`, brand._id, designer._id, i, stats);
  }

  console.log(
    `Seed complete: brands +${stats.brandsCreated}/~${stats.brandsUpdated} updated, designers +${stats.designersCreated}/~${stats.designersUpdated}, products +${stats.productsCreated}/~${stats.productsUpdated}`
  );
}

async function main() {
  await connectToDatabase({ maxRetries: 1 }).catch(() => {});
  if (mongoose.connection.readyState !== 1) {
    console.log('Seed skipped: no database connection available');
    process.exit(0);
  }

  const useSample = String(process.env.SEED_FROM_SAMPLE || '').toLowerCase() === 'true';
  const useGenerate = String(process.env.SEED_GENERATE_DUMMIES || '').toLowerCase() === 'true';

  if (useSample) {
    await seedFromSampleJSON();
  } else if (useGenerate) {
    await seedGenerateDummies();
  } else {
    console.log('No seed performed. Set SEED_FROM_SAMPLE=true to import sample JSON, or SEED_GENERATE_DUMMIES=true to generate placeholders (dev only).');
  }

  await disconnectFromDatabase();
}

main().catch((e) => {
  console.error('Seed error', e);
  process.exit(1);
});
