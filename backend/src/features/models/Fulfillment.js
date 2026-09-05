const mongoose = require('mongoose');

const fulfillmentLineSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: String,
  requiredQuantity: { type: Number, required: true },
  allocatedQuantity: { type: Number, default: 0 },
  backorderQuantity: { type: Number, default: 0 },
  allocations: [{
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    quantity: Number
  }]
});

const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  orderNumber: { type: String, required: true },
  
  // High-level fulfillment status
  status: { 
    type: String, 
    enum: ['Ready', 'Allocating', 'Allocated', 'Partially Fulfilled', 'Shipped', 'Delivered'],
    default: 'Ready'
  },
  
  lines: [fulfillmentLineSchema],
  
  estimatedShippingCost: { type: Number, default: 0 },
  estimatedShipments: { type: Number, default: 0 },
  
  deliveryTimeline: String // e.g., "60-90 days"
}, { timestamps: true });

module.exports = mongoose.model('Fulfillment', schema);
