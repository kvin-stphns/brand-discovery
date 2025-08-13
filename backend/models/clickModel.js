const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    url: { type: String, required: true },
    // where the click originated in the app UI
    source: {
      type: String,
      enum: ['featured', 'popular', 'grid', 'product', 'affiliate', 'checkout'],
      default: 'product',
    },
    // optional analytics
    utm: { type: String },
    ipHash: { type: String, index: true },
    userAgent: { type: String },
  },
  { timestamps: true }
);

const Click = mongoose.models.Click || mongoose.model('Click', ClickSchema);
module.exports = { Click };