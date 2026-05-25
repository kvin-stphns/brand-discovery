const mongoose = require('mongoose');

const FeedImportLogSchema = new mongoose.Schema(
  {
    feedSourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedSource', index: true },
    source: { type: String, required: true, index: true },
    filename: { type: String },
    status: {
      type: String,
      enum: ['started', 'completed', 'completed_with_warnings', 'failed'],
      default: 'started',
      index: true,
    },
    counts: {
      total: { type: Number, default: 0 },
      imported: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
      created: { type: Number, default: 0 },
      updated: { type: Number, default: 0 },
    },
    warnings: [{ type: String }],
    errors: [{ type: String }],
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

const FeedImportLog = mongoose.models.FeedImportLog || mongoose.model('FeedImportLog', FeedImportLogSchema);
module.exports = { FeedImportLog };
