const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');
const { requireAuth, requireRole } = require('../../middleware/authMiddleware');

router.use(requireAuth);
router.use(requireRole(['CUSTOMER']));

// B2B Dashboard Summary
router.get('/dashboard', async (req, res) => {
  try {
    const customerId = req.user.customerId;
    if (!customerId) return res.status(403).json({ error: 'No customer profile linked' });

    const [deals, quotations, invoices] = await Promise.all([
      Deal.find({ customerId, companyId: req.companyId }),
      Quotation.find({ customerId, companyId: req.companyId }),
      Invoice.find({ customerId, companyId: req.companyId })
    ]);

    const activeDeals = deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Lost');
    const pendingQuotes = quotations.filter(q => q.status !== 'Accepted' && q.status !== 'Rejected');
    const unpaidInvoices = invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue');

    res.json({
      totalDeals: deals.length,
      activeDeals: activeDeals.length,
      totalQuotations: quotations.length,
      pendingQuotations: pendingQuotes.length,
      totalInvoices: invoices.length,
      unpaidInvoices: unpaidInvoices.length,
      totalOutstanding: unpaidInvoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0),
      pipelineValue: deals.reduce((sum, d) => sum + (d.value || 0), 0)
    });
  } catch (err) {
    console.error('B2B Dashboard Error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Customer's Quotations
router.get('/quotations', async (req, res) => {
  try {
    const customerId = req.user.customerId;
    if (!customerId) return res.status(403).json({ error: 'No customer profile linked' });

    const quotations = await Quotation.find({ customerId, companyId: req.companyId })
      .populate('dealId', 'title dealNumber stage')
      .sort({ createdAt: -1 });

    res.json(quotations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load quotations' });
  }
});

// Customer's Deals
router.get('/deals', async (req, res) => {
  try {
    const customerId = req.user.customerId;
    if (!customerId) return res.status(403).json({ error: 'No customer profile linked' });

    const deals = await Deal.find({ customerId, companyId: req.companyId })
      .sort({ createdAt: -1 });

    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load deals' });
  }
});

// Customer's Invoices
router.get('/invoices', async (req, res) => {
  try {
    const customerId = req.user.customerId;
    if (!customerId) return res.status(403).json({ error: 'No customer profile linked' });

    const invoices = await Invoice.find({ customerId, companyId: req.companyId })
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load invoices' });
  }
});

module.exports = router;
