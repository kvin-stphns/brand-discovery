const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema(
  {
    value: { type: Number },
    currency: { type: String, default: 'USD' },
    originalValue: { type: Number },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    // Identity
    source: { type: String, required: true, index: true },
    sourceId: { type: String, required: true, index: true }, // canonical per-site id

    // Linking
    canonicalUrl: { type: String },
    affiliateUrl: { type: String },

    // Retailer / feed metadata
    retailer: { type: String, index: true },
    retailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', index: true },
    feedSourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedSource', index: true },

    // Naming
    title: { type: String, required: true, index: true },
    slug: { type: String, index: true }, // non-unique search index

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

    dataQuality: {
      hasTitle: { type: Boolean, default: false },
      hasBrand: { type: Boolean, default: false },
      hasImage: { type: Boolean, default: false },
      hasPrice: { type: Boolean, default: false },
      hasDescription: { type: Boolean, default: false },
      score: { type: Number, default: 0, index: true },
      issues: [{ type: String }],
    },
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
ProductSchema.index({ category: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ 'price.value': 1 });

ProductSchema.pre('validate', function ensureDataQuality(next) {
  const hasTitle = Boolean(this.title && String(this.title).trim());
  const hasBrand = Boolean(this.brand && String(this.brand).trim());
  const hasImage = Array.isArray(this.images) && this.images.some(Boolean);
  const hasPrice = Boolean(this.price && Number(this.price.value) > 0);
  const hasDescription = Boolean(this.description && String(this.description).trim());
  if (!this.dataQuality || !this.dataQuality.score) {
    this.dataQuality = {
      hasTitle,
      hasBrand,
      hasImage,
      hasPrice,
      hasDescription,
      score: [hasTitle, hasBrand, hasImage, hasPrice, hasDescription].filter(Boolean).length,
      issues: [
        !hasTitle && 'missing_title',
        !hasBrand && 'missing_brand',
        !hasImage && 'missing_image',
        !hasPrice && 'missing_price',
      ].filter(Boolean),
    };
  }
  next();
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
module.exports = { Product };
