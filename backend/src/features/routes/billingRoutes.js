const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const { requireAuth, requireRole } = require('../../middleware/authMiddleware');

const Deal = require('../models/Deal');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find({ companyId: req.companyId })
      .populate('customerId', 'name email address')
      .populate('dealId', 'title stage')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, companyId: req.companyId })
      .populate('customerId')
      .populate('dealId');
    if (!invoice) return res.status(404).json({ error: 'Not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const Subscription = require('../models/Subscription');

router.post('/:id/pay', requireRole(['COMPANY_ADMIN', 'FINANCE']), async (req, res) => {
  try {
    const { amount, method, reference, notes } = req.body;
    const invoice = await Invoice.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!invoice) return res.status(404).json({ error: 'Not found' });
    
    const payAmount = Number(amount);
    
    invoice.paymentHistory.push({
      paymentNumber: `PAY-${Date.now().toString().slice(-6)}`,
      date: new Date(),
      amount: payAmount,
      method: method || 'Wire Transfer',
      reference: reference || 'N/A',
      notes
    });
    
    invoice.paidAmount += payAmount;
    invoice.balanceDue = Math.max(0, invoice.total - invoice.paidAmount);
    
    if (invoice.balanceDue === 0) {
      invoice.status = 'Paid';
      
      // Auto-update linked deal to Completed & Paid
      if (invoice.dealId) {
        await Deal.findByIdAndUpdate(invoice.dealId, {
          stage: 'Completed',
          billingStatus: 'Paid',
          fulfillmentStatus: 'Completed'
        });
      } else if (invoice.customerId) {
        await Deal.updateMany(
          { customerId: invoice.customerId, companyId: req.companyId, stage: { $ne: 'Completed' } },
          { stage: 'Completed', billingStatus: 'Paid' }
        );
      }

      // Auto-register recurring Subscription for Monthly/Annual items
      try {
        const hasRecurringItems = (invoice.items || []).some(item => 
          item.description?.toLowerCase().includes('annual') ||
          item.description?.toLowerCase().includes('monthly') ||
          item.description?.toLowerCase().includes('subscription')
        );

        if (hasRecurringItems || invoice.notes?.toLowerCase().includes('recurring')) {
          const isAnnual = (invoice.items || []).some(i => i.description?.toLowerCase().includes('annual')) || invoice.notes?.toLowerCase().includes('annual');
          const billingType = isAnnual ? 'Annual Recurring' : 'Monthly Recurring';
          
          const nextDate = new Date();
          if (isAnnual) {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
          } else {
            nextDate.setMonth(nextDate.getMonth() + 1);
          }

          const firstItem = invoice.items?.[0]?.description || 'Enterprise Solution Subscription';

          await Subscription.create({
            companyId: invoice.companyId,
            customerId: invoice.customerId,
            dealId: invoice.dealId,
            productName: firstItem,
            billingType,
            amount: invoice.subtotal || invoice.total,
            startDate: new Date(),
            nextBillingDate: nextDate,
            status: 'Active',
            lastInvoicedDate: new Date(),
            items: invoice.items
          });
        }
      } catch (subErr) {
        console.error('Error auto-creating subscription:', subErr);
      }

    } else if (invoice.status === 'Draft') {
      invoice.status = 'Pending';
    }
    
    await invoice.save();
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
