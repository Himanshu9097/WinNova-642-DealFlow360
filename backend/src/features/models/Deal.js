const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  
  dealNumber: String, title: String, 
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  stage: { type: String, default: 'Draft' },
  value: Number, riskScore: Number, riskLevel: String,
  estimatedMargin: Number, technicalStatus: String,
  approvalStatus: { type: String, default: 'Not Required' },
  negotiationStatus: String,
  fulfillmentStatus: String,
  billingStatus: String,
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
  }]
}, { timestamps: true });
module.exports = mongoose.model('Deal', schema);