require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./src/features/models/Company');
const Product = require('./src/features/models/Product');
const Warehouse = require('./src/features/models/Warehouse');
const Inventory = require('./src/features/models/Inventory');
const Fulfillment = require('./src/features/models/Fulfillment');
const Customer = require('./src/features/models/Customer');
const Deal = require('./src/features/models/Deal');

async function seedOperations() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dealflow360');
  
  // Find Acme company
  const company = await Company.findOne({ name: 'Acme Technologies' });
  if (!company) {
    console.log('Company not found! Run the main seed first.');
    process.exit(1);
  }

  // Clear existing operations data for a clean slate
  await Warehouse.deleteMany({ companyId: company._id });
  await Inventory.deleteMany({ companyId: company._id });
  await Fulfillment.deleteMany({ companyId: company._id });

  // 1. Create Warehouses
  const delhi = await Warehouse.create({ companyId: company._id, name: 'Delhi Warehouse', location: 'New Delhi' });
  const mumbai = await Warehouse.create({ companyId: company._id, name: 'Mumbai Warehouse', location: 'Mumbai' });

  // 2. Find or Create Product
  let product = await Product.findOne({ companyId: company._id });
  if (!product) {
    product = await Product.create({
      companyId: company._id,
      sku: 'CAM-IP68-8MP',
      name: 'Outdoor Camera IP68 8MP',
      basePrice: 13000,
      cost: 8000
    });
  } else {
    product.name = 'Outdoor Camera IP68 8MP';
    await product.save();
  }

  // 3. Add Stock
  await Inventory.create({ companyId: company._id, warehouseId: delhi._id, productId: product._id, availableStock: 60 });
  await Inventory.create({ companyId: company._id, warehouseId: mumbai._id, productId: product._id, availableStock: 40 });

  // 4. Create a Customer and Deal
  let customer = await Customer.findOne({ companyId: company._id, name: 'TechCorp' });
  if (!customer) customer = await Customer.create({ companyId: company._id, name: 'TechCorp', email: 'buyer@techcorp.com' });

  let deal = await Deal.findOne({ companyId: company._id, customerId: customer._id });
  if (!deal) deal = await Deal.create({ companyId: company._id, customerId: customer._id, title: 'Security Upgrade Q3', stage: 'Closed Won' });

  // 5. Create a Ready Fulfillment Order
  const fulfillment = await Fulfillment.create({
    companyId: company._id,
    customerId: customer._id,
    dealId: deal._id,
    orderNumber: 'SO-1042',
    status: 'Ready',
    lines: [{
      productId: product._id,
      name: product.name,
      requiredQuantity: 100
    }],
    deliveryTimeline: '60 days'
  });

  console.log('Operations Seed Complete!');
  console.log('Fulfillment Order created for 100 units.');
  console.log('Inventory configured: Delhi(60), Mumbai(40).');
  process.exit();
}

seedOperations();
