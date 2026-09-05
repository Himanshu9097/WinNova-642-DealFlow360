const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const { calculateTotals } = require('../services/pricingService');
const { evaluateApproval } = require('../services/approvalRoutingService');
const { requireAuth } = require('../../middleware/authMiddleware');

router.use(requireAuth);

const Approval = require('../models/Approval');
const Deal = require('../models/Deal');

router.post('/', async (req, res) => {
  try {
    let data = req.body;
    if(data.lines) {
      data.totals = calculateTotals(data.lines);
    }
    
    const Company = require('../models/Company');
    const company = await Company.findById(req.companyId);
    const maxLimit = company ? company.maxAllowedDiscount : 8;

    let status = 'Draft';
    let discountPct = 0;
    if (data.totals && data.totals.gross > 0) {
      discountPct = (data.totals.discount / data.totals.gross) * 100;
      if (discountPct > maxLimit) {
        status = 'Pending Approval';
      }
    }

    const quote = await Quotation.create({ ...data, status, companyId: req.companyId });
    
    if (status === 'Pending Approval') {
      await Approval.create({
        companyId: req.companyId,
        requestNumber: `APP-${Date.now().toString().slice(-6)}`,
        type: 'Quotation Discount',
        dealId: quote.dealId,
        quotationId: quote._id,
        requesterId: req.user._id,
        details: `Discount of ${discountPct.toFixed(1)}% requested (Limit: ${maxLimit}%)`,
        amountAtRisk: data.totals.discount
      });
      
      await Deal.findByIdAndUpdate(quote.dealId, { approvalStatus: 'Pending' });
    }

    res.json(quote);
  } catch (err) {
    console.error("CREATE QUOTATION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  let data = req.body;
  if(data.lines) {
    data.totals = calculateTotals(data.lines);
  }
  
  const Company = require('../models/Company');
  const company = await Company.findById(req.companyId);
  const maxLimit = company ? company.maxAllowedDiscount : 8;

  let status = data.status || 'Draft';
  let discountPct = 0;
  if (data.totals && data.totals.gross > 0) {
    discountPct = (data.totals.discount / data.totals.gross) * 100;
    if (discountPct > maxLimit) {
      status = 'Pending Approval';
    }
  }

  const quote = await Quotation.findOneAndUpdate(
    { _id: req.params.id, companyId: req.companyId },
    { ...data, status },
    { new: true }
  );

  if (status === 'Pending Approval') {
    // Check if pending approval already exists
    const existing = await Approval.findOne({ quotationId: quote._id, status: 'Pending' });
    if (!existing) {
      await Approval.create({
        companyId: req.companyId,
        requestNumber: `APP-${Date.now().toString().slice(-6)}`,
        type: 'Quotation Counter Offer',
        dealId: quote.dealId,
        quotationId: quote._id,
        requesterId: req.user._id,
        details: `Customer Counter: Discount of ${discountPct.toFixed(1)}% requested (Limit: ${maxLimit}%)`,
        amountAtRisk: data.totals.discount
      });
      await Deal.findByIdAndUpdate(quote.dealId, { approvalStatus: 'Pending' });
    }
  }

  res.json(quote);
});

router.get('/:id', async (req, res) => {
  const quote = await Quotation.findOne({ _id: req.params.id, companyId: req.companyId });
  if (!quote) return res.status(404).json({ error: 'Quotation not found' });
  res.json(quote);
});

module.exports = router;