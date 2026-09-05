const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  productId: { type: String, required: true },
  availableStock: { type: Number, default: 0 },
  allocatedStock: { type: Number, default: 0 }
}, { timestamps: true });

// Prevent duplicate inventory records for the same product in the same warehouse
schema.index({ companyId: 1, warehouseId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', schema);
