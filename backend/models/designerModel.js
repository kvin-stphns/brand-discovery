const mongoose = require('mongoose');

const DesignerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    image: { type: String },
    url: { type: String },
    tags: [{ type: String, index: true }],
  },
  { timestamps: true }
);

const Designer = mongoose.models.Designer || mongoose.model('Designer', DesignerSchema);
module.exports = { Designer };