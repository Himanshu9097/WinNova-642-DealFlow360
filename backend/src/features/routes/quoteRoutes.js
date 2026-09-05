const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const { calculateTotals } = require('../services/pricingService');
const { evaluateApproval } = require('../services/approvalRoutingService');
const { requireAuth } = require('../../middleware/authMiddleware');

router.use(requireAuth);

router.post('/', async (req, res) => {
  let data = req.body;
  if(data.lines) {
    data.totals = calculateTotals(data.lines);
  }
  const quote = await Quotation.create({ ...data, companyId: req.companyId });
  res.json(quote);
});

router.get('/:id', async (req, res) => {
  const quote = await Quotation.findOne({ _id: req.params.id, companyId: req.companyId });
  if (!quote) return res.status(404).json({ error: 'Quotation not found' });
  res.json(quote);
});

module.exports = router;