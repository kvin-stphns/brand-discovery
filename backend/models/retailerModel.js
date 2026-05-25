const mongoose = require('mongoose');

const RetailerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    website: { type: String },
    affiliateNetwork: { type: String },
    affiliateProgramUrl: { type: String },
    contactEmail: { type: String },
    contactUrl: { type: String },
    status: {
      type: String,
      enum: ['target', 'applied', 'approved', 'rejected', 'direct', 'inactive'],
      default: 'target',
      index: true,
    },
    priority: { type: String, enum: ['A', 'B', 'C'], default: 'B', index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const Retailer = mongoose.models.Retailer || mongoose.model('Retailer', RetailerSchema);
module.exports = { Retailer };
