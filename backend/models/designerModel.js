const mongoose = require('mongoose')

const DesignerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
<<<<<<< HEAD
    slug: { type: String, required: true, unique: true, index: true },
    image: { type: String },
    url: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
=======
    slug: { type: String, required: true, unique: true },
    image: { type: String },
    tags: [{ type: String, index: true }],
  },
  { timestamps: true }
>>>>>>> 6a9a98b (Add product scraping, database models, and MongoDB memory server support)
)

const Designer = mongoose.models.Designer || mongoose.model('Designer', DesignerSchema)
module.exports = { Designer }