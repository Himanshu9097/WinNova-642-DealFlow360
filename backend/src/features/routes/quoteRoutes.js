const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const { calculateTotals } = require('../services/pricingService');
const { calculateRisk } = require('../services/riskEngineService');
const { evaluateApproval } = require('../services/approvalRoutingService');
const { requireAuth, requireRole } = require('../../middleware/authMiddleware');
const crypto = require('crypto');
const Approval = require('../models/Approval');
const Deal = require('../models/Deal');

// --- PUBLIC PORTAL ENDPOINTS ---
router.get('/portal/:token', async (req, res) => {
  try {
    const quote = await Quotation.findOne({ customerToken: req.params.token })
      .populate('dealId', 'title customerId deliveryTimeline')
      .populate('customerId', 'name');
    
    if (!quote) return res.status(404).json({ error: 'Invalid or expired secure link' });
    
    const deal = await Deal.findById(quote.dealId._id).populate('customerId', 'name');
    // Using dummy requirements as real model might not have it
    const requirements = [
      { _id: '1', label: 'IP Rating', offeredValue: 'IP68' },
      { _id: '2', label: 'Resolution', offeredValue: '8MP' }
    ];

    res.json({ quote, deal, requirements });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load quote' });
  }
});

router.post('/portal/:token/accept', async (req, res) => {
  try {
    const quote = await Quotation.findOne({ customerToken: req.params.token });
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    
    quote.status = 'Accepted';
    await quote.save();
    
    res.json({ success: true, quote });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept quote' });
  }
});

router.post('/portal/:token/counter', async (req, res) => {
  try {
    const { proposedDiscount } = req.body;
    const quote = await Quotation.findOne({ customerToken: req.params.token });
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    
    quote.status = 'Negotiating';
    quote.proposedDiscountPct = proposedDiscount;
    await quote.save();
    
    // Create approval for manager
    const discountValue = (quote.totals.gross * proposedDiscount) / 100;
    
    // We need to find the user who created it, but this is a public route, so we use admin or system
    const User = require('../models/User');
    const admin = await User.findOne({ companyId: quote.companyId, role: 'COMPANY_ADMIN' });
    
    await Approval.create({
      companyId: quote.companyId,
      requestNumber: `APP-${Date.now().toString().slice(-6)}`,
      type: 'Customer Counter Offer',
      dealId: quote.dealId,
      quotationId: quote._id,
      requesterId: admin ? admin._id : quote.companyId, // Fallback
      status: 'Pending',
      details: `Customer requested a new discount of ${proposedDiscount}%`,
      amountAtRisk: discountValue
    });
    
    res.json({ success: true, quote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit counter offer' });
  }
});

// --- AUTHENTICATED ENDPOINTS ---

router.use(requireAuth);

router.post('/', requireRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']), async (req, res) => {
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

    const { riskScore, riskFactors, riskLevel } = await calculateRisk(
      req.companyId,
      data.lines || [],
      discountPct,
      maxLimit,
      data.totals?.net || 0
    );

    const customerToken = crypto.randomBytes(16).toString('hex');
    const quote = await Quotation.create({ 
      ...data, 
      status, 
      companyId: req.companyId, 
      customerToken,
      riskScore,
      riskFactors
    });
    
    if (quote.dealId) {
      const dealUpdate = { riskScore, riskLevel };
      if (status === 'Pending Approval') dealUpdate.approvalStatus = 'Pending';
      await Deal.findByIdAndUpdate(quote.dealId, dealUpdate);
    }

    if (status === 'Pending Approval') {
      const riskDetails = riskFactors.length > 0 ? `\nRisk Factors: ${riskFactors.join(', ')}` : '';
      await Approval.create({
        companyId: req.companyId,
        requestNumber: `APP-${Date.now().toString().slice(-6)}`,
        type: 'Quotation Discount',
        dealId: quote.dealId,
        quotationId: quote._id,
        requesterId: req.user._id,
        status: 'Pending',
        details: `Discount of ${discountPct.toFixed(1)}% requested (Limit: ${maxLimit}%). Risk Score: ${riskScore}.${riskDetails}`,
        amountAtRisk: data.totals.discount
      });
    }

    res.json(quote);
  } catch (err) {
    console.error("CREATE QUOTATION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']), async (req, res) => {
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

  const { riskScore, riskFactors, riskLevel } = await calculateRisk(
    req.companyId,
    data.lines || [],
    discountPct,
    maxLimit,
    data.totals?.net || 0
  );

  const quote = await Quotation.findOneAndUpdate(
    { _id: req.params.id, companyId: req.companyId },
    { ...data, status, riskScore, riskFactors },
    { new: true }
  );

  if (quote.dealId) {
    const dealUpdate = { riskScore, riskLevel };
    if (status === 'Pending Approval') dealUpdate.approvalStatus = 'Pending';
    await Deal.findByIdAndUpdate(quote.dealId, dealUpdate);
  }

  if (status === 'Pending Approval') {
    // Check if pending approval already exists
    const existing = await Approval.findOne({ quotationId: quote._id, status: 'Pending' });
    if (!existing) {
      const riskDetails = riskFactors.length > 0 ? `\nRisk Factors: ${riskFactors.join(', ')}` : '';
      await Approval.create({
        companyId: req.companyId,
        requestNumber: `APP-${Date.now().toString().slice(-6)}`,
        type: 'Quotation Counter Offer',
        dealId: quote.dealId,
        quotationId: quote._id,
        requesterId: req.user._id,
        details: `Customer Counter: Discount of ${discountPct.toFixed(1)}% requested (Limit: ${maxLimit}%). Risk Score: ${riskScore}.${riskDetails}`,
        amountAtRisk: data.totals.discount
      });
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