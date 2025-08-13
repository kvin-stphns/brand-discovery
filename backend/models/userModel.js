const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    wallet: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const User = mongoose.models.User || mongoose.model('User', UserSchema)
module.exports = { User }