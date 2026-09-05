const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const { calculateTotals } = require('../services/pricingService');
const { evaluateApproval } = require('../services/approvalRoutingService');

router.post('/', async (req, res) => {
  let data = req.body;
  if(data.lines) {
    data.totals = calculateTotals(data.lines);
  }
  const quote = await Quotation.create(data);
  res.json(quote);
});
router.get('/:id', async (req, res) => {
  const quote = await Quotation.findById(req.params.id);
  res.json(quote);
});

module.exports = router;