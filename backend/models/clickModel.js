const mongoose = require('mongoose')

const ClickSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    url: { type: String, required: true },
    source: { type: String, enum: ['featured', 'popular', 'grid', 'product'], required: true },
    utm: { type: String },
    ipHash: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
=======
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    url: { type: String, required: true },
    ipHash: { type: String, index: true },
    userAgent: { type: String },
  },
  { timestamps: true }
>>>>>>> 6a9a98b (Add product scraping, database models, and MongoDB memory server support)
)

const Click = mongoose.models.Click || mongoose.model('Click', ClickSchema)
module.exports = { Click }