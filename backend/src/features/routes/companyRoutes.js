const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { requireAuth } = require('../../middleware/authMiddleware');

router.use(requireAuth);

// Get Company Settings
router.get('/settings', async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Company Settings (Admin Only ideally, but open to authenticated user for simplicity in this prototype)
router.put('/settings', async (req, res) => {
  try {
    const { maxAllowedDiscount } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      { maxAllowedDiscount },
      { new: true }
    );
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
