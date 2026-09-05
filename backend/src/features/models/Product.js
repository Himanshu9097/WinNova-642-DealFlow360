const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  sku: String, name: String, description: String,
  basePrice: Number, cost: Number, 
  billingType: String
}, { timestamps: true });
module.exports = mongoose.model('Product', schema);