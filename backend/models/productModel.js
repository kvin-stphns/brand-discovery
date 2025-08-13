const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema(
  {
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    designerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Designer' },
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    images: [{ type: String }],
    price: { type: Number },
    currency: { type: String, default: 'USD' },
    url: { type: String },
    tags: [{ type: String, index: true }],
    source: { type: String, enum: ['farfetch', 'ssense', 'demo'], index: true },
  },
  { timestamps: true }
)

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)
module.exports = { Product }