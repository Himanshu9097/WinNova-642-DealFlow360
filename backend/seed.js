require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/features/models/User');
const Customer = require('./src/features/models/Customer');
const Deal = require('./src/features/models/Deal');
const Product = require('./src/features/models/Product');
const Requirement = require('./src/features/models/Requirement');
const Quotation = require('./src/features/models/Quotation');

const seedData = async () => {
  await connectDB();
  
  console.log('Clearing old data...');
  await User.deleteMany();
  await Customer.deleteMany();
  await Deal.deleteMany();
  await Product.deleteMany();
  await Requirement.deleteMany();
  await Quotation.deleteMany();

  console.log('Inserting seed data...');
  
  const seller = await User.create({ name: 'Alice Sales', email: 'alice@dealflow360.com', role: 'Sales Rep' });
  const manager = await User.create({ name: 'Bob Manager', email: 'bob@dealflow360.com', role: 'Sales Manager' });

  const customer = await Customer.create({ name: 'ACME Industrial Systems Pvt. Ltd.', industry: 'Manufacturing', email: 'buyer@acme.com' });

  const product1 = await Product.create({ sku: 'CAM-IP68-8M', name: 'Outdoor IP68 Security Camera', description: '8MP, PoE, Night Vision', basePrice: 250, cost: 150, billingType: 'ONE_TIME' });
  const product2 = await Product.create({ sku: 'SUB-MON-01', name: 'Recurring Monitoring', description: 'Monthly monitoring service', basePrice: 50, cost: 10, billingType: 'RECURRING' });

  const deal = await Deal.create({
    dealNumber: 'DF-1042',
    title: 'ACME 100 Camera Deployment',
    customerId: customer._id,
    ownerId: seller._id,
    stage: 'Proposal',
    value: 25000,
    riskScore: 20,
    riskLevel: 'Low',
    estimatedMargin: 10000,
    technicalStatus: 'Compliant',
    approvalStatus: 'Pending',
    negotiationStatus: 'Active',
    fulfillmentStatus: 'Pending',
    billingStatus: 'Pending'
  });

  await Requirement.create([
    { dealId: deal._id, specKey: 'ingress_protection', label: 'Ingress Protection', requiredValue: 'IP68', mandatory: true, status: 'PASS', offeredValue: 'IP68' },
    { dealId: deal._id, specKey: 'resolution', label: 'Resolution', requiredValue: '8MP', mandatory: true, status: 'PASS', offeredValue: '8MP' }
  ]);

  console.log('Seeding complete!');
  process.exit();
};

seedData().catch(err => {
  console.error(err);
  process.exit(1);
});
