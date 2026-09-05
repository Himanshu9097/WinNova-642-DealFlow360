require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

const Company = require('./features/models/Company');
const User = require('./features/models/User');
const Customer = require('./features/models/Customer');
const Deal = require('./features/models/Deal');
const Requirement = require('./features/models/Requirement');
const Quotation = require('./features/models/Quotation');
const Approval = require('./features/models/Approval');
const Fulfillment = require('./features/models/Fulfillment');
const Invoice = require('./features/models/Invoice');
const Warehouse = require('./features/models/Warehouse');
const Inventory = require('./features/models/Inventory');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/winnova';

const seedWorkflow = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Clear relevant collections
    await Promise.all([
      Company.deleteMany({}), User.deleteMany({}), Customer.deleteMany({}),
      Deal.deleteMany({}), Requirement.deleteMany({}), Quotation.deleteMany({}),
      Approval.deleteMany({}), Fulfillment.deleteMany({}), Invoice.deleteMany({}),
      Warehouse.deleteMany({}), Inventory.deleteMany({})
    ]);
    console.log('Cleared existing data.');

    // 2. Create Company
    const company = await Company.create({ name: 'Acme Corp', domain: 'acme.com', email: 'admin@acme.com', subscriptionPlan: 'ENTERPRISE' });

    // 3. Create Users (Admin, Sales, Manager, Operations, Finance)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const admin = await User.create({ companyId: company._id, name: 'Admin', email: 'admin@acme.com', passwordHash: hashedPassword, role: 'COMPANY_ADMIN', status: 'ACTIVE' });
    const amit = await User.create({ companyId: company._id, name: 'Amit Kumar', email: 'amit@acme.com', passwordHash: hashedPassword, role: 'SALES_REP', status: 'ACTIVE' });
    const priya = await User.create({ companyId: company._id, name: 'Priya Mehta', email: 'priya@acme.com', passwordHash: hashedPassword, role: 'SALES_MANAGER', status: 'ACTIVE' });
    const rohit = await User.create({ companyId: company._id, name: 'Rohit Sharma', email: 'rohit@acme.com', passwordHash: hashedPassword, role: 'OPERATIONS', status: 'ACTIVE' });
    const neha = await User.create({ companyId: company._id, name: 'Neha Gupta', email: 'neha@acme.com', passwordHash: hashedPassword, role: 'FINANCE', status: 'ACTIVE' });

    // 4. Create Customer
    const customer = await Customer.create({ companyId: company._id, name: 'GlobalTech Inc', email: 'contact@globaltech.com' });

    // 5. Create Deal
    const deal = await Deal.create({
      companyId: company._id,
      dealNumber: 'DL-2026-001',
      title: 'GlobalTech IP68 Security Upgrade',
      customerId: customer._id,
      stage: 'Negotiation',
      value: 1240000,
      estimatedMargin: 120280,
      closeDate: new Date(Date.now() + 15 * 86400000),
      ownerId: amit._id,
      riskLevel: 'Medium'
    });

    // 6. Create Requirements
    await Requirement.create({
      companyId: company._id,
      dealId: deal._id,
      label: 'Ingress Protection',
      requiredValue: 'IP68',
      offeredValue: 'IP68',
      mandatory: true,
      status: 'PASS'
    });
    
    await Requirement.create({
      companyId: company._id,
      dealId: deal._id,
      label: 'Resolution',
      requiredValue: '8MP',
      offeredValue: '8MP',
      mandatory: true,
      status: 'PASS'
    });

    // 7. Create Products
    const Product = require('./features/models/Product');
    const p1 = await Product.create({ companyId: company._id, name: 'Outdoor Camera IP68 8MP', sku: 'CAM-8MP-IP68', category: 'Hardware', price: 13000 });
    const p2 = await Product.create({ companyId: company._id, name: 'PoE+ Injector', sku: 'POE-INJ-01', category: 'Accessories', price: 1500 });

    // 8. Create Quotation
    const quote = await Quotation.create({
      companyId: company._id,
      quoteNumber: 'QTN-2026-001',
      dealId: deal._id,
      status: 'Draft',
      lines: [
        { productId: p1._id, quantity: 100, unitPrice: 13000, cost: 11000, discountPct: 0, lineTotal: 1300000, margin: 200000 },
        { productId: p2._id, quantity: 100, unitPrice: 1500, cost: 1200, discountPct: 0, lineTotal: 150000, margin: 30000 }
      ],
      totals: { gross: 1450000, discount: 0, net: 1450000, margin: 230000 }
    });

    // 9. Create Warehouses and initial inventory for Operations to fulfill later
    const w1 = await Warehouse.create({
      companyId: company._id,
      name: 'Mumbai Central',
      location: 'Mumbai, MH',
      type: 'Primary',
      capacity: 10000,
      status: 'Active'
    });
    
    await Inventory.create({ companyId: company._id, warehouseId: w1._id, productId: p1._id, available: 50, allocated: 0 });
    await Inventory.create({ companyId: company._id, warehouseId: w1._id, productId: p2._id, available: 150, allocated: 0 });

    console.log('Seeding complete! You can now login as Amit to start the flow.');
    console.log('Sales: amit@acme.com / password123');
    console.log('Manager: priya@acme.com / password123');
    console.log('Ops: rohit@acme.com / password123');
    console.log('Finance: neha@acme.com / password123');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedWorkflow();
