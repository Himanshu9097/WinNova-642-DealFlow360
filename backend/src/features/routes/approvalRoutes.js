const express = require('express');
const router = express.Router();
const Approval = require('../models/Approval');
const Quotation = require('../models/Quotation');
const { requireAuth, requireRole } = require('../../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const approvals = await Approval.find({ companyId: req.companyId })
      .populate('requesterId', 'name role')
      .populate('dealId', 'title')
      .populate({
        path: 'quotationId',
        populate: { path: 'customerId', select: 'name' }
      })
      .sort({ createdAt: -1 });
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/action', requireRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'FINANCE']), async (req, res) => {
  try {
    const { action, comment } = req.body; // action: 'APPROVE' or 'REJECT'
    const approval = await Approval.findOne({ _id: req.params.id, companyId: req.companyId });
    
    if (!approval) return res.status(404).json({ error: 'Not found' });
    
    approval.status = action === 'APPROVE' ? 'Approved' : 'Rejected';
    approval.comment = comment;
    approval.actionedAt = new Date();
    await approval.save();
    
    // If this approval was for a quotation, update the quote status
    if (approval.quotationId) {
      const quote = await Quotation.findOne({ _id: approval.quotationId });
      if (quote) {
        if (approval.type === 'Customer Counter Offer') {
          if (action === 'APPROVE') {
            quote.status = 'Accepted';
            if (quote.proposedDiscountPct) {
              const newDiscount = (quote.totals.gross * quote.proposedDiscountPct) / 100;
              quote.totals.discount = newDiscount;
              quote.totals.net = quote.totals.gross - newDiscount;
            }
          } else {
            quote.status = 'Rejected by Seller';
          }
        } else {
          quote.status = action === 'APPROVE' ? 'Approved' : 'Rejected';
        }
        
        await quote.save();
        
        if (action === 'APPROVE') {
          // 1. Deduct Inventory
          const Inventory = require('../models/Inventory');
          for (const line of quote.lines) {
            if (!line.productId) continue;
            let requiredQty = line.quantity;
            const inventories = await Inventory.find({ companyId: req.companyId, productId: line.productId, availableStock: { $gt: 0 } });
            
            for (const inv of inventories) {
              if (requiredQty <= 0) break;
              const deduct = Math.min(inv.availableStock, requiredQty);
              inv.availableStock -= deduct;
              requiredQty -= deduct;
              await inv.save();
            }
          }
          
          // 2. Generate Invoice
          const Invoice = require('../models/Invoice');
          const invoice = new Invoice({
            companyId: req.companyId,
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            customerId: quote.customerId,
            dealId: quote.dealId,
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days net
            status: 'Pending',
            items: quote.lines.map(l => ({
              description: l.name || 'Product',
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              total: l.lineTotal
            })),
            subtotal: quote.totals?.gross || 0,
            taxRate: 18,
            taxAmount: ((quote.totals?.net || 0) * 0.18),
            total: (quote.totals?.net || 0) * 1.18,
            balanceDue: (quote.totals?.net || 0) * 1.18
          });
          await invoice.save();
        }
      }
    }
    
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
