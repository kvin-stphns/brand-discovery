const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // what is being voted on
    entityType: { type: String, enum: ['brand', 'designer', 'product'], required: true, index: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    // vote intensity (keep name 'weight' for compatibility)
    weight: { type: Number, default: 1 },

    // optional metadata for on-chain/web3 votes
    source: { type: String, enum: ['web2', 'web3'], default: 'web2' },
    txHash: { type: String },
  },
  { timestamps: true }
);

// helpful compound index
VoteSchema.index({ entityType: 1, entityId: 1 });

const Vote = mongoose.models.Vote || mongoose.model('Vote', VoteSchema);
module.exports = { Vote };