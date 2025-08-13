const mongoose = require('mongoose')

const VoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
<<<<<<< HEAD
    entityType: { type: String, enum: ['brand', 'designer', 'product'], required: true, index: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    weight: { type: Number, default: 1 },
    source: { type: String, enum: ['web2', 'web3'], default: 'web2' },
    txHash: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
=======
    entityType: { type: String, enum: ['brand', 'designer', 'product'], required: true },
    entityId: { type: String, required: true },
    value: { type: Number, default: 1 },
  },
  { timestamps: true }
>>>>>>> 6a9a98b (Add product scraping, database models, and MongoDB memory server support)
)

VoteSchema.index({ entityType: 1, entityId: 1 })

const Vote = mongoose.models.Vote || mongoose.model('Vote', VoteSchema)
module.exports = { Vote }