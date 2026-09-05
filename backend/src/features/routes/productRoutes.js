const express = require('express');
const Product = require('../models/Product');
const { requireAuth, requireRole } = require('../../middleware/authMiddleware');

const router = express.Router();

// Get all products for the company
router.get('/', requireAuth, async (req, res) => {
  try {
    const products = await Product.find({ companyId: req.companyId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create a new product (admin only)
router.post('/', requireAuth, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const { sku, name, description, basePrice, cost, billingType, maxDiscount } = req.body;
    
    const product = new Product({
      companyId: req.companyId,
      sku,
      name,
      description,
      basePrice,
      cost,
      billingType,
      maxDiscount
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update a product (admin only)
router.put('/:id', requireAuth, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const { sku, name, description, basePrice, cost, billingType, maxDiscount } = req.body;
    
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      { sku, name, description, basePrice, cost, billingType, maxDiscount },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product (admin only)
router.delete('/:id', requireAuth, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
