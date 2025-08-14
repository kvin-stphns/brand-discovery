const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema(
  {
    value: { type: Number, index: true },
    currency: { type: String, default: 'USD' },
    originalValue: { type: Number }, // was-price for sales
  },
  { _id: false }
);

const SizeSchema = new mongoose.Schema(
  {
    label: { type: String },
    available: { type: Boolean, default: true },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    // Identity
    externalId: { type: String, index: true }, // unique per source
    source: { type: String, enum: ['farfetch', 'ssense', 'other'], required: true, index: true },

    // Naming / linking
    name: { type: String, required: true, index: true },
    slug: { type: String, index: true },
    url: { type: String, required: true, unique: true },

    // Brand / designer linkage
    brand: { type: String, index: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', index: true },
    designer: { type: String, index: true },
    designerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Designer', index: true },

    // Pricing
    price: { type: PriceSchema },

    // Media
    media: [{ type: String }],              // primary + gallery (preferred)
    image: { type: String },                // backward-compat primary image
    images: [{ type: String }],             // backward-compat array

    // Content
    description: { type: String },
    details: [{ type: String }],
    sizes: [SizeSchema],
    shipping: { type: String },

    // Taxonomy
    category: { type: String, index: true },
    gender: { type: String, enum: ['men', 'women', 'unisex', ''], default: '' },

    // Misc
    tags: [{ type: String, index: true }],
  },
  { timestamps: true }
);

// Composite unique to dedupe upserts from scrapers
ProductSchema.index({ source: 1, externalId: 1 }, { unique: true });
// Helpful query index
ProductSchema.index({ source: 1, createdAt: -1 });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
module.exports = { Product };