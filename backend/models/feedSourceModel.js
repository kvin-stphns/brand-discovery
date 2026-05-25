const mongoose = require('mongoose');

const FeedSourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    source: { type: String, required: true, unique: true, index: true },
    retailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', index: true },
    type: {
      type: String,
      enum: ['demo-json', 'manual-json', 'manual-csv', 'affiliate-network', 'direct-api', 'direct-csv', 'scrape-enrichment'],
      default: 'manual-json',
      index: true,
    },
    network: { type: String },
    status: {
      type: String,
      enum: ['active', 'paused', 'prototype', 'needs-approval'],
      default: 'prototype',
      index: true,
    },
    config: { type: mongoose.Schema.Types.Mixed },
    lastImportedAt: { type: Date },
  },
  { timestamps: true }
);

const FeedSource = mongoose.models.FeedSource || mongoose.model('FeedSource', FeedSourceSchema);
module.exports = { FeedSource };
