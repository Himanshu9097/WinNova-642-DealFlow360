const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  requestNumber: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'Quotation Discount', 'Deal Margin Risk'
  
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  details: { type: String }, // e.g. "Discount of 15% requested (Limit: 8%)"
  amountAtRisk: { type: Number },
  
  comment: { type: String },
  actionedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Approval', schema);
