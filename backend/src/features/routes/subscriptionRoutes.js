const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const { requireAuth, requireRole } = require('../../middleware/authMiddleware');
const { processRecurringSubscriptions } = require('../../utils/recurringBillingEngine');

router.use(requireAuth);

// GET all subscriptions for company
router.get('/', async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ companyId: req.companyId })
      .populate('customerId', 'name email contact')
      .populate('dealId', 'title')
      .sort({ nextBillingDate: 1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Manual Trigger for Recurring Billing Engine Run
router.post('/run-now', requireRole(['COMPANY_ADMIN', 'FINANCE']), async (req, res) => {
  try {
    const result = await processRecurringSubscriptions();
    res.json({
      success: true,
      message: `Recurring billing run completed. Processed ${result.processed} subscriptions.`,
      invoicesCreated: result.invoicesCreated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Create Subscription
router.post('/', requireRole(['COMPANY_ADMIN', 'FINANCE']), async (req, res) => {
  try {
    const { customerId, dealId, quotationId, productName, billingType, amount, nextBillingDate, items } = req.body;
    
    const sub = await Subscription.create({
      companyId: req.companyId,
      customerId,
      dealId,
      quotationId,
      productName: productName || 'Enterprise Subscription',
      billingType: billingType || 'Monthly',
      amount: Number(amount),
      nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : new Date(Date.now() + 30 * 86400000),
      items: items || [{ description: productName, quantity: 1, unitPrice: Number(amount) }]
    });

    res.status(201).json(sub);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
