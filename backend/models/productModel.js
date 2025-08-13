const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
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
=======
    name: { type: String, required: true, index: true },
    slug: { type: String, index: true },
    brand: { type: String, index: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', index: true },
    designer: { type: String, index: true },
    designerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Designer', index: true },
    price: { type: Number },
    currency: { type: String, default: 'USD' },
    image: { type: String },
    url: { type: String, required: true, unique: true },
    source: { type: String, enum: ['farfetch', 'ssense', 'other'], required: true, index: true },
    tags: [{ type: String, index: true }],
>>>>>>> 6a9a98b (Add product scraping, database models, and MongoDB memory server support)
  },
  { timestamps: true }
)

<<<<<<< HEAD
=======
ProductSchema.index({ source: 1, createdAt: -1 })

>>>>>>> 6a9a98b (Add product scraping, database models, and MongoDB memory server support)
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)
module.exports = { Product }