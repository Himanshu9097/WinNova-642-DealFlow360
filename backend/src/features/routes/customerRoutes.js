const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { requireAuth, requireRole } = require('../../middleware/authMiddleware');

router.use(requireAuth);

// Get all customers for the company
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find({ companyId: req.user.companyId }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new customer
router.post('/', requireRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']), async (req, res) => {
  try {
    const { name, email, industry, phone, website, address, contactPerson } = req.body;
    const customer = new Customer({
      companyId: req.user.companyId,
      name, email, industry, phone, website, address, contactPerson
    });
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
