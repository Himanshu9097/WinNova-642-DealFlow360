const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'features', 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const models = {
  'User.js': `
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: String, email: String, role: String
}, { timestamps: true });
module.exports = mongoose.model('User', schema);
  `,
  'Customer.js': `
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: String, industry: String, email: String
}, { timestamps: true });
module.exports = mongoose.model('Customer', schema);
  `,
  'Deal.js': `
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
  `,
  'Product.js': `
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  sku: String, name: String, description: String,
  basePrice: Number, cost: Number, 
  billingType: String
}, { timestamps: true });
module.exports = mongoose.model('Product', schema);
  `,
  'Requirement.js': `
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  specKey: String, label: String, requiredValue: String,
  mandatory: Boolean, status: String, offeredValue: String
}, { timestamps: true });
module.exports = mongoose.model('Requirement', schema);
  `,
  'Quotation.js': `
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
  `
};

for (const [filename, content] of Object.entries(models)) {
  fs.writeFileSync(path.join(modelsDir, filename), content.trim());
}
console.log('Models generated');
