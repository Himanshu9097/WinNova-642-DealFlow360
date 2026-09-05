const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'features', 'services');
const routesDir = path.join(__dirname, 'src', 'features', 'routes');
if (!fs.existsSync(servicesDir)) fs.mkdirSync(servicesDir, { recursive: true });
if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir, { recursive: true });

const services = {
  'pricingService.js': `
exports.calculateTotals = (lines) => {
  let gross = 0;
  let discount = 0;
  let costTotal = 0;
  lines.forEach(line => {
    let subtotal = line.quantity * line.unitPrice;
    let lineDiscount = subtotal * (line.discountPct / 100);
    line.lineTotal = subtotal - lineDiscount;
    line.margin = line.lineTotal - (line.cost * line.quantity || 0);
    
    gross += subtotal;
    discount += lineDiscount;
    costTotal += (line.cost * line.quantity || 0);
  });
  const net = gross - discount;
  const margin = net - costTotal;
  return { gross, discount, net, margin };
};
  `,
  'approvalRoutingService.js': `
exports.evaluateApproval = (requestedDiscount, allowedDiscount = 10, margin = 0, isTechnicalCompliant = true) => {
  if (!isTechnicalCompliant) return { required: true, reason: 'Technical Non-Compliance' };
  if (requestedDiscount > allowedDiscount) return { required: true, reason: \`Discount \${requestedDiscount}% exceeds allowed \${allowedDiscount}%\` };
  if (margin < 0) return { required: true, reason: 'Negative Margin' };
  return { required: false, reason: 'Auto-Approved' };
};
  `,
  'technicalComplianceService.js': `
exports.evaluateCompliance = (requirements) => {
  let isCompliant = true;
  const results = requirements.map(req => {
    let passed = false;
    if (req.requiredValue === req.offeredValue) passed = true;
    else if (req.operator === '>=' && parseFloat(req.offeredValue) >= parseFloat(req.requiredValue)) passed = true;
    
    if (req.mandatory && !passed) isCompliant = false;
    req.status = passed ? 'PASS' : 'FAIL';
    return req;
  });
  return { isCompliant, results };
};
  `
};

for (const [filename, content] of Object.entries(services)) {
  fs.writeFileSync(path.join(servicesDir, filename), content.trim());
}

const routes = {
  'dealRoutes.js': `
const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');

router.get('/', async (req, res) => {
  const deals = await Deal.find().populate('customerId');
  res.json(deals);
});
router.post('/', async (req, res) => {
  const deal = await Deal.create(req.body);
  res.json(deal);
});
router.get('/:id', async (req, res) => {
  const deal = await Deal.findById(req.params.id).populate('customerId');
  res.json(deal);
});

module.exports = router;
  `,
  'quoteRoutes.js': `
const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const { calculateTotals } = require('../services/pricingService');
const { evaluateApproval } = require('../services/approvalRoutingService');

router.post('/', async (req, res) => {
  let data = req.body;
  if(data.lines) {
    data.totals = calculateTotals(data.lines);
  }
  const quote = await Quotation.create(data);
  res.json(quote);
});
router.get('/:id', async (req, res) => {
  const quote = await Quotation.findById(req.params.id);
  res.json(quote);
});

module.exports = router;
  `
};

for (const [filename, content] of Object.entries(routes)) {
  fs.writeFileSync(path.join(routesDir, filename), content.trim());
}

console.log('Services and routes generated');
