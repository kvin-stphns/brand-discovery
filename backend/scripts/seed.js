#!/usr/bin/env node
require('dotenv').config()
const mongoose = require('mongoose')
const { connectToDatabase, disconnectFromDatabase } = require('../utils/db')
const { Brand } = require('../models/brandModel')
const { Designer } = require('../models/designerModel')
const { Product } = require('../models/productModel')

const brandTypes = ['Streetwear', 'High Fashion', 'Avant Garde', 'Hybrid', 'Techwear', 'Workwear', 'Other']
const productCategories = ['Tops', 'Bottoms', 'Outerwear', 'Accessories']

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function upsertBrand(name, idx, stats) {
  const slug = slugify(name)
  const exists = await Brand.exists({ slug })
  const update = {
    name,
    slug,
    image: `/placeholders/brand-${(idx % 4) + 1}.jpg`,
    tags: [brandTypes[idx % brandTypes.length]],
    location: 'Global',
    links: { website: `https://example.com/${slug}` },
  }
  const doc = await Brand.findOneAndUpdate({ slug }, update, { new: true, upsert: true, setDefaultsOnInsert: true })
  exists ? (stats.brandsUpdated++) : (stats.brandsCreated++)
  return doc
}

async function upsertDesigner(name, idx, stats) {
  const slug = slugify(name)
  const exists = await Designer.exists({ slug })
  const update = {
    name,
    slug,
    image: `/placeholders/designer-${(idx % 4) + 1}.jpg`,
    url: `https://example.com/${slug}`,
  }
  const doc = await Designer.findOneAndUpdate({ slug }, update, { new: true, upsert: true, setDefaultsOnInsert: true })
  exists ? (stats.designersUpdated++) : (stats.designersCreated++)
  return doc
}

async function upsertProduct(name, brandId, designerId, idx, stats) {
  const slug = slugify(name)
  const exists = await Product.exists({ slug })
  const update = {
    name,
    slug,
    brandId,
    designerId,
    images: [`/placeholders/product-${(idx % 4) + 1}.jpg`],
    price: 100 + (idx % 10) * 25,
    currency: 'USD',
    url: `https://example.com/product/${slug}`,
    tags: [productCategories[idx % productCategories.length]],
  }
  const doc = await Product.findOneAndUpdate({ slug }, update, { new: true, upsert: true, setDefaultsOnInsert: true })
  exists ? (stats.productsUpdated++) : (stats.productsCreated++)
  return doc
}

async function main() {
  await connectToDatabase({ maxRetries: 1 }).catch(() => {})
  if (mongoose.connection.readyState !== 1) {
    // eslint-disable-next-line no-console
    console.log('Seed skipped: no database connection available')
    process.exit(0)
  }
  const stats = { brandsCreated: 0, brandsUpdated: 0, designersCreated: 0, designersUpdated: 0, productsCreated: 0, productsUpdated: 0 }

  const brands = []
  for (let i = 1; i <= 20; i++) {
    // eslint-disable-next-line no-await-in-loop
    const b = await upsertBrand(`Brand ${i}`, i, stats)
    brands.push(b)
  }

  const designers = []
  for (let i = 1; i <= 15; i++) {
    // eslint-disable-next-line no-await-in-loop
    const d = await upsertDesigner(`Designer ${i}`, i, stats)
    designers.push(d)
  }

  const products = []
  const totalProducts = 80
  for (let i = 1; i <= totalProducts; i++) {
    const brand = brands[i % brands.length]
    const designer = designers[i % designers.length]
    // eslint-disable-next-line no-await-in-loop
    const p = await upsertProduct(`Product ${i}`, brand._id, designer._id, i, stats)
    products.push(p)
  }

  // eslint-disable-next-line no-console
  console.log(`Seed complete: brands +${stats.brandsCreated}/~${stats.brandsUpdated} updated, designers +${stats.designersCreated}/~${stats.designersUpdated}, products +${stats.productsCreated}/~${stats.productsUpdated}`)
  await disconnectFromDatabase()
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('Seed error', e)
  process.exit(1)
})