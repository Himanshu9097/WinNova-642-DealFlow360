const express = require('express');
const router = express.Router();
const Fulfillment = require('../models/Fulfillment');
const Inventory = require('../models/Inventory');
const { requireAuth, requireRole } = require('../../middleware/authMiddleware');

router.use(requireAuth);

// Get all fulfillments
router.get('/', async (req, res) => {
  try {
    const fulfillments = await Fulfillment.find({ companyId: req.companyId })
      .populate('customerId', 'name email')
      .populate('dealId', 'title')
      .sort({ createdAt: -1 });
    res.json(fulfillments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get fulfillment by ID
router.get('/:id', async (req, res) => {
  try {
    const fulfillment = await Fulfillment.findOne({ _id: req.params.id, companyId: req.companyId })
      .populate('customerId')
      .populate('dealId')
      .populate('lines.productId')
      .populate('lines.allocations.warehouseId');
    if (!fulfillment) return res.status(404).json({ error: 'Not found' });
    res.json(fulfillment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate recommended split
router.get('/:id/recommendation', async (req, res) => {
  try {
    const fulfillment = await Fulfillment.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!fulfillment) return res.status(404).json({ error: 'Not found' });

    let recommendation = [];
    
    // For each line, find inventory and calculate split
    for (const line of fulfillment.lines) {
      // Find all inventory records for this product in active warehouses
      const inventory = await Inventory.find({ 
        companyId: req.companyId, 
        productId: line.productId,
        availableStock: { $gt: 0 } 
      }).populate('warehouseId').sort({ availableStock: -1 }); // Sort by largest stock first to minimize shipments

      let required = line.requiredQuantity;
      let lineAllocations = [];
      
      for (const inv of inventory) {
        if (required <= 0) break;
        
        const take = Math.min(required, inv.availableStock);
        lineAllocations.push({
          warehouseId: inv.warehouseId._id,
          warehouseName: inv.warehouseId.name,
          quantity: take
        });
        required -= take;
      }
      
      recommendation.push({
        lineId: line._id,
        productId: line.productId,
        productName: line.name,
        requiredQuantity: line.requiredQuantity,
        allocations: lineAllocations,
        backorderQuantity: required > 0 ? required : 0
      });
    }

    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept split (allocate stock)
router.post('/:id/allocate', requireRole(['COMPANY_ADMIN', 'OPERATIONS']), async (req, res) => {
  try {
    const { lineAllocations } = req.body; // Array matching recommendation format
    const fulfillment = await Fulfillment.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!fulfillment) return res.status(404).json({ error: 'Not found' });

    let totalShipments = new Set();
    
    // Process allocations
    for (const alloc of lineAllocations) {
      const line = fulfillment.lines.id(alloc.lineId);
      if (!line) continue;
      
      line.allocations = [];
      let totalAllocated = 0;
      
      for (const wa of alloc.allocations) {
        // Find inventory record
        const inv = await Inventory.findOne({ 
          companyId: req.companyId, 
          warehouseId: wa.warehouseId, 
          productId: line.productId 
        });
        
        if (!inv || inv.availableStock < wa.quantity) {
          throw new Error(`Insufficient stock in warehouse ${wa.warehouseName} for product ${line.name}`);
        }
        
        // Deduct from available, add to allocated
        inv.availableStock -= wa.quantity;
        inv.allocatedStock += wa.quantity;
        await inv.save();
        
        line.allocations.push({
          warehouseId: wa.warehouseId,
          quantity: wa.quantity
        });
        totalAllocated += wa.quantity;
        totalShipments.add(wa.warehouseId.toString());
      }
      
      line.allocatedQuantity = totalAllocated;
      line.backorderQuantity = alloc.backorderQuantity;
    }
    
    // Update fulfillment status
    fulfillment.status = fulfillment.lines.some(l => l.backorderQuantity > 0) ? 'Partially Fulfilled' : 'Allocated';
    fulfillment.estimatedShipments = totalShipments.size;
    fulfillment.estimatedShippingCost = totalShipments.size * 7000; // Mock 7000 INR per shipment
    
    await fulfillment.save();
    res.json(fulfillment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
