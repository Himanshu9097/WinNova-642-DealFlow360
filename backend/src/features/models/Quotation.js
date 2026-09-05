const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  quoteNumber: String, dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  version: Number, formatType: String, status: String,
  lines: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number, unitPrice: Number, discountPct: Number,
    lineTotal: Number, margin: Number
  }],
  totals: {
    gross: Number, discount: Number, net: Number, margin: Number
  },
  approvalState: String
}, { timestamps: true });
module.exports = mongoose.model('Quotation', schema);