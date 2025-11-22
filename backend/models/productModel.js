const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema(
  {
    value: { type: Number, index: true },
    currency: { type: String, default: 'USD' },
    originalValue: { type: Number },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    // Identity
    source: { type: String, enum: ['farfetch', 'ssense', 'other'], required: true, index: true },
    sourceId: { type: String, required: true, index: true }, // canonical per-site id

    // Linking
    canonicalUrl: { type: String },

    // Naming
    title: { type: String, required: true, index: true },
    slug: { type: String, index: true }, // non-unique search index

    // Brand / designer (flat for now)
    // Brand / designer (flat for now)
    brand: { type: String },
    gender: { type: String, index: true }, // Men, Women, Unisex

    // Pricing
    price: { type: PriceSchema },

    // Media
    images: [{ type: String }],

    // Content
    description: { type: String },
    details: [{ type: String }],
    sizes: [{ type: String }],
    availability: { type: String },
    sku: { type: String },
    color: { type: String },

    // Taxonomy
    category: [{ type: String }],
    breadcrumbs: [{ type: String }],

    // Policy
    shipping: { type: String },
    returns: { type: String },
  },
  {
    timestamps: true,
    autoIndex: false, // avoid implicit index changes; use migration script
  }
);

// Dedup key
ProductSchema.index({ source: 1, sourceId: 1 }, { unique: true });
// Useful queries
ProductSchema.index({ brand: 1 });
ProductSchema.index({ createdAt: -1 });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
module.exports = { Product };
