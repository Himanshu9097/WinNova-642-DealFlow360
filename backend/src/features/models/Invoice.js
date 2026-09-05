const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: String,
  quantity: Number,
  unitPrice: Number,
  total: Number
});

const paymentHistorySchema = new mongoose.Schema({
  paymentNumber: String,
  date: Date,
  amount: Number,
  method: String,
  reference: String,
  notes: String
});

const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  invoiceNumber: { type: String, required: true },
  
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  fulfillmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fulfillment' },
  
  issueDate: Date,
  dueDate: Date,
  paymentTerms: String,
  
  status: { type: String, enum: ['Draft', 'Pending', 'Overdue', 'Paid'], default: 'Pending' },
  
  items: [invoiceItemSchema],
  
  subtotal: Number,
  taxRate: { type: Number, default: 18 },
  taxAmount: Number,
  total: Number,
  
  paidAmount: { type: Number, default: 0 },
  balanceDue: Number,
  currency: { type: String, default: 'INR' },
  
  notes: String,
  paymentHistory: [paymentHistorySchema]
}, { timestamps: true });

module.exports = mongoose.model('Invoice', schema);
