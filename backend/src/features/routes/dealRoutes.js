const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const Requirement = require('../models/Requirement');
const Quotation = require('../models/Quotation');

router.get('/', async (req, res) => {
  const deals = await Deal.find().populate('customerId');
  res.json(deals);
});
router.post('/', async (req, res) => {
  const deal = await Deal.create(req.body);
  res.json(deal);
});
router.get('/:id', async (req, res) => {
  const deal = await Deal.findById(req.params.id).populate('customerId');
  const requirements = await Requirement.find({ dealId: deal._id });
  const quotations = await Quotation.find({ dealId: deal._id });
  res.json({ deal, requirements, quotations });
});

module.exports = router;