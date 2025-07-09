const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  logo: { type: String }, // URL or Cloudinary path
  contactEmail: { type: String },
  phone: { type: String },
  location: {
    city: String,
    pincode: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
