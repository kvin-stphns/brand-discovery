const path = require('path');
const { Product } = require('../../models/productModel');
const { Retailer } = require('../../models/retailerModel');
const { FeedSource } = require('../../models/feedSourceModel');
const { FeedImportLog } = require('../../models/feedImportLogModel');
const { normalizeProduct, slugify, cleanText } = require('./normalizeProduct');

async function upsertRetailer(name, row = {}) {
  const retailerName = cleanText(name || row.retailer || row.merchant || 'Discovery Demo', 120);
  const slug = slugify(retailerName);
  return Retailer.findOneAndUpdate(
    { slug },
    {
      $set: {
        name: retailerName,
        slug,
        website: row.retailerWebsite || row.website || row.storeUrl || row.store_url || undefined,
        affiliateNetwork: row.affiliateNetwork || row.network || undefined,
        affiliateProgramUrl: row.affiliateProgramUrl || row.affiliate_program_url || undefined,
        priority: row.priority || 'B',
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function upsertFeedSource({ source, sourceType, feedName, retailerId }) {
  return FeedSource.findOneAndUpdate(
    { source },
    {
      $set: {
        name: feedName || source,
        source,
        type: sourceType || 'manual-json',
        retailerId,
        network: source === 'demo-json' ? 'Demo' : undefined,
        status: source === 'demo-json' ? 'prototype' : 'needs-approval',
        lastImportedAt: new Date(),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function importProducts(rows, options = {}) {
  const source = cleanText(options.source || 'manual-json', 80);
  const sourceType = cleanText(options.sourceType || options.type || 'manual-json', 80);
  const filename = options.filename ? path.relative(process.cwd(), options.filename) : undefined;

  const firstRetailer = rows.find((row) => row && (row.retailer || row.merchant || options.retailer)) || {};
  const defaultRetailer = await upsertRetailer(options.retailer || firstRetailer.retailer || firstRetailer.merchant || 'Discovery Demo', firstRetailer);
  const feedSource = await upsertFeedSource({ source, sourceType, feedName: options.feedName, retailerId: defaultRetailer._id });

  const log = await FeedImportLog.create({
    feedSourceId: feedSource._id,
    source,
    filename,
    status: 'started',
    counts: { total: rows.length, imported: 0, rejected: 0, created: 0, updated: 0 },
    warnings: [],
    errors: [],
    startedAt: new Date(),
  });

  const counts = { total: rows.length, imported: 0, rejected: 0, created: 0, updated: 0 };
  const warnings = [];
  const errors = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] || {};
    const normalized = normalizeProduct(row, { source, retailer: defaultRetailer.name });
    if (!normalized.valid) {
      counts.rejected += 1;
      warnings.push(`row ${index + 1}: rejected (${normalized.issues.join(', ')})`);
      continue;
    }

    try {
      const retailer = await upsertRetailer(normalized.product.retailer, row);
      const product = {
        ...normalized.product,
        retailerId: retailer._id,
        feedSourceId: feedSource._id,
      };
      const exists = await Product.exists({ source: product.source, sourceId: product.sourceId });
      await Product.updateOne(
        { source: product.source, sourceId: product.sourceId },
        { $set: product, $setOnInsert: { createdAt: new Date() } },
        { upsert: true, runValidators: true }
      );
      counts.imported += 1;
      if (exists) counts.updated += 1;
      else counts.created += 1;
    } catch (error) {
      counts.rejected += 1;
      errors.push(`row ${index + 1}: ${error.message}`);
    }
  }

  await FeedImportLog.findByIdAndUpdate(log._id, {
    status: errors.length ? 'completed_with_warnings' : warnings.length ? 'completed_with_warnings' : 'completed',
    counts,
    warnings,
    errors,
    finishedAt: new Date(),
  });

  return {
    ok: errors.length === 0,
    source,
    feedSourceId: String(feedSource._id),
    logId: String(log._id),
    counts,
    warnings,
    errors,
  };
}

module.exports = {
  importProducts,
  upsertRetailer,
  upsertFeedSource,
};
