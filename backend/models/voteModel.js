const mongoose = require('mongoose')

const VoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    entityType: { type: String, enum: ['brand', 'designer', 'product'], required: true, index: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    weight: { type: Number, default: 1 },
    source: { type: String, enum: ['web2', 'web3'], default: 'web2' },
    txHash: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

VoteSchema.index({ entityType: 1, entityId: 1 })

const Vote = mongoose.models.Vote || mongoose.model('Vote', VoteSchema)
module.exports = { Vote }