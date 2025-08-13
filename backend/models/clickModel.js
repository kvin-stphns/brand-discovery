const mongoose = require('mongoose')

const ClickSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    url: { type: String, required: true },
    source: { type: String, enum: ['featured', 'popular', 'grid', 'product'], required: true },
    utm: { type: String },
    ipHash: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const Click = mongoose.models.Click || mongoose.model('Click', ClickSchema)
module.exports = { Click }