#!/usr/bin/env node
/* eslint-disable no-console */
require('dotenv').config()
const mongoose = require('mongoose')
const { connectToDatabase, disconnectFromDatabase } = require('../utils/db')

async function run() {
  await connectToDatabase().catch(() => {})
  const db = mongoose.connection.db
  const coll = db.collection('products')

  const ops = []

  // 1) Backfill title from legacy name
  const r1 = await coll.updateMany(
    { $or: [{ title: { $exists: false } }, { title: '' }] , name: { $type: 'string', $ne: '' } },
    [{ $set: { title: '$name' } }]
  )
  ops.push({ op: 'backfill_title', matched: r1.matchedCount, modified: r1.modifiedCount })

  // 2) Backfill images from legacy media/images/image
  const r2 = await coll.updateMany(
    { $or: [{ images: { $exists: false } }, { images: { $size: 0 } }], media: { $type: 'array', $ne: [] } },
    [{ $set: { images: '$media' } }]
  )
  ops.push({ op: 'backfill_images_from_media', matched: r2.matchedCount, modified: r2.modifiedCount })

  const r3 = await coll.updateMany(
    { $or: [{ images: { $exists: false } }, { images: { $size: 0 } }], image: { $type: 'string', $ne: '' } },
    [{ $set: { images: ['$image'] } }]
  )
  ops.push({ op: 'backfill_images_from_image', matched: r3.matchedCount, modified: r3.modifiedCount })

  console.log(JSON.stringify({ ok: true, ops }))
  await disconnectFromDatabase()
}

run().catch((e) => { console.error('backfill failed', e); process.exit(1) })

