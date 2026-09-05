const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const { requireAuth, requireRole } = require('../../middleware/authMiddleware');

// Base middleware for all inventory routes
router.use(requireAuth);

// --- Warehouse Routes ---

// Get all warehouses for company
router.get('/warehouses', async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ companyId: req.companyId, isActive: true });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create warehouse (Admin / Operations)
router.post('/warehouses', requireRole(['COMPANY_ADMIN', 'OPERATIONS']), async (req, res) => {
  try {
    const warehouse = new Warehouse({
      ...req.body,
      companyId: req.companyId
    });
    await warehouse.save();
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- Inventory Routes ---

// Get inventory for a product across warehouses
router.get('/product/:productId', async (req, res) => {
  try {
    const inventory = await Inventory.find({ 
      companyId: req.companyId, 
      productId: req.params.productId 
    }).populate('warehouseId');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or update stock
router.post('/stock', requireRole(['COMPANY_ADMIN', 'OPERATIONS']), async (req, res) => {
  try {
    const { warehouseId, productId, quantity } = req.body;
    let inv = await Inventory.findOne({ companyId: req.companyId, warehouseId, productId });
    
    if (inv) {
      inv.availableStock += quantity;
      await inv.save();
    } else {
      inv = new Inventory({
        companyId: req.companyId,
        warehouseId,
        productId,
        availableStock: quantity
      });
      await inv.save();
    }
    res.json(inv);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all inventory across all warehouses (Global Matrix)
router.get('/all', async (req, res) => {
  try {
    const inventory = await Inventory.find({ companyId: req.companyId })
      .populate('warehouseId', 'name location')
      .populate('productId', 'name sku');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products (helper for Add Stock form)
router.get('/products', async (req, res) => {
  try {
    // Assuming Product model is required
    const Product = require('../models/Product');
    const products = await Product.find({ companyId: req.companyId }).select('name sku _id');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
