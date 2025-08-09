const mongoose = require('mongoose')

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String },
    tags: [{ type: String, index: true }],
    location: { type: String },
    links: {
      website: String,
      instagram: String,
      twitter: String,
      shop: String,
    },
  },
  { timestamps: true }
)

const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema)
module.exports = { Brand } 