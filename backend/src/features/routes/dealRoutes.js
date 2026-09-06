const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const Requirement = require('../models/Requirement');
const Quotation = require('../models/Quotation');
const Customer = require('../models/Customer');
const { requireAuth, requireRole } = require('../../middleware/authMiddleware');

router.use(requireAuth);

const Invoice = require('../models/Invoice');

router.get('/', async (req, res) => {
  try {
    const deals = await Deal.find({ companyId: req.companyId }).populate('customerId');
    const invoices = await Invoice.find({ companyId: req.companyId, status: 'Paid' });
    
    // Map paid deal IDs
    const paidDealIds = new Set(invoices.map(i => i.dealId?.toString()).filter(Boolean));
    
    for (const deal of deals) {
      if (paidDealIds.has(deal._id.toString()) && deal.stage !== 'Completed') {
        deal.stage = 'Completed';
        deal.billingStatus = 'Paid';
        await deal.save();
      }
    }
    
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']), async (req, res) => {
  try {
    const { productLines, ...dealData } = req.body;

    // Validate stock availability across all warehouses before allowing deal creation
    if (productLines && productLines.length > 0) {
      const Inventory = require('../models/Inventory');
      for (const line of productLines) {
        if (!line.productId) continue;
        const stockRecords = await Inventory.find({ companyId: req.companyId, productId: line.productId });
        const totalAvailable = stockRecords.reduce((sum, r) => sum + (r.availableStock || 0), 0);
        if (totalAvailable < line.quantity) {
          return res.status(400).json({ 
            error: `Insufficient stock for product ${line.productId}. Available: ${totalAvailable}, Requested: ${line.quantity}` 
          });
        }
      }
    }

    const deal = await Deal.create({ ...dealData, products: productLines, companyId: req.companyId });
    // Note: Warehouse allocation & inventory deduction is handled by Operations team via Fulfillment
    res.json(deal);
  } catch (err) {
    console.error('Create deal error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const deal = await Deal.findOne({ _id: req.params.id, companyId: req.companyId }).populate('customerId');
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  
  const requirements = await Requirement.find({ dealId: deal._id, companyId: req.companyId });
  const quotations = await Quotation.find({ dealId: deal._id, companyId: req.companyId });
  res.json({ deal, requirements, quotations });
});

router.put('/:id', requireRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']), async (req, res) => {
  const { stage } = req.body;
  const deal = await Deal.findOneAndUpdate(
    { _id: req.params.id, companyId: req.companyId },
    { stage },
    { new: true }
  );
  
  if (stage === 'Closed Won') {
    // HOOK: Auto-generate Fulfillment & Invoice
    const Fulfillment = require('../models/Fulfillment');
    const Invoice = require('../models/Invoice');
    const Quotation = require('../models/Quotation');
    
    const quote = await Quotation.findOne({ dealId: deal._id, companyId: req.companyId }).sort({ createdAt: -1 });
    
    if (quote) {
      // 1. Generate Fulfillment
      const fulfillment = await Fulfillment.create({
        companyId: req.companyId,
        customerId: deal.customerId,
        dealId: deal._id,
        quotationId: quote._id,
        orderNumber: `SO-${Date.now().toString().slice(-6)}`,
        status: 'Ready',
        lines: quote.lines.map(l => ({
          productId: l.productId,
          name: `Product ${l.productId}`, // We'll mock this for now since quote lines don't populate product name natively
          requiredQuantity: l.quantity
        })),
        deliveryTimeline: '60 days'
      });
      
      // 2. Generate 50% Advance Invoice
      await Invoice.create({
        companyId: req.companyId,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        customerId: deal.customerId,
        dealId: deal._id,
        fulfillmentId: fulfillment._id,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 15 * 86400000), // Net 15
        paymentTerms: 'Net 15',
        status: 'Pending',
        items: [{
          description: '50% Advance Payment for Order ' + fulfillment.orderNumber,
          quantity: 1,
          unitPrice: quote.totals.net * 0.5,
          total: quote.totals.net * 0.5
        }],
        subtotal: quote.totals.net * 0.5,
        taxRate: 0,
        taxAmount: 0,
        total: quote.totals.net * 0.5,
        balanceDue: quote.totals.net * 0.5
      });
    }
  }
  
  res.json(deal);
});

router.delete('/:id', requireRole(['COMPANY_ADMIN', 'SALES_MANAGER']), async (req, res) => {
  try {
    const deal = await Deal.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    
    // Optionally cleanup related records like quotations and requirements
    const Requirement = require('../models/Requirement');
    const Quotation = require('../models/Quotation');
    await Requirement.deleteMany({ dealId: req.params.id, companyId: req.companyId });
    await Quotation.deleteMany({ dealId: req.params.id, companyId: req.companyId });
    
    res.json({ message: 'Deal deleted successfully' });
  } catch (err) {
    console.error('Delete deal error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;