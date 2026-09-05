const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  dealNumber: String, title: String, 
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  stage: { type: String, default: 'Draft' },
  value: Number, riskScore: Number, riskLevel: String,
  estimatedMargin: Number, technicalStatus: String,
  approvalStatus: { type: String, default: 'Not Required' },
  negotiationStatus: String,
  fulfillmentStatus: String,
  billingStatus: String
}, { timestamps: true });
module.exports = mongoose.model('Deal', schema);