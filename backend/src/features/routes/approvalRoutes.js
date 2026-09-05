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
      .populate('quotationId', 'quoteNumber')
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
        quote.status = action === 'APPROVE' ? 'Approved' : 'Rejected';
        await quote.save();
      }
    }
    
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
