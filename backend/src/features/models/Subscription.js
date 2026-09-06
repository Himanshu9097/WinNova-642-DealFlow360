const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },

  productName: { type: String, required: true },
  billingType: { type: String, enum: ['Monthly', 'Annual', 'Monthly Recurring', 'Annual Recurring'], default: 'Monthly' },
  amount: { type: Number, required: true },
  
  startDate: { type: Date, default: Date.now },
  nextBillingDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Paused', 'Cancelled', 'Expired'], default: 'Active' },
  lastInvoicedDate: Date,
  totalInvoicesIssued: { type: Number, default: 1 },

  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
