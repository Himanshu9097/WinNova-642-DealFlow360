const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const Requirement = require('../models/Requirement');
const Quotation = require('../models/Quotation');
const { requireAuth } = require('../../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const deals = await Deal.find({ companyId: req.companyId }).populate('customerId');
  res.json(deals);
});

router.post('/', async (req, res) => {
  const deal = await Deal.create({ ...req.body, companyId: req.companyId });
  res.json(deal);
});

router.get('/:id', async (req, res) => {
  const deal = await Deal.findOne({ _id: req.params.id, companyId: req.companyId }).populate('customerId');
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  
  const requirements = await Requirement.find({ dealId: deal._id, companyId: req.companyId });
  const quotations = await Quotation.find({ dealId: deal._id, companyId: req.companyId });
  res.json({ deal, requirements, quotations });
});

module.exports = router;