require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Company = require('./src/features/models/Company');
const User = require('./src/features/models/User');

const seedData = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:15LKWkyxBnGSjcLt@completebackend.lqoulh3.mongodb.net/');
  console.log('Connected to DB');

  await Company.deleteMany({});
  await User.deleteMany({});
  console.log('Cleared DB');

  const company = await Company.create({
    name: 'Acme Technologies',
    email: 'admin@acme.com',
    industry: 'Software',
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const users = [
    { name: 'Rahul Sharma', email: 'rahul@acme.com', role: 'COMPANY_ADMIN', department: 'Admin' },
    { name: 'Priya Mehta', email: 'priya@acme.com', role: 'SALES_MANAGER', department: 'Sales' },
    { name: 'Amit Kumar', email: 'amit@acme.com', role: 'SALES_REP', department: 'Sales' },
    { name: 'Neha Singh', email: 'neha@acme.com', role: 'FINANCE', department: 'Finance' },
    { name: 'Rohit Verma', email: 'rohit@acme.com', role: 'OPERATIONS', department: 'Operations' },
    { name: 'TechCorp Client', email: 'client@techcorp.com', role: 'CUSTOMER', department: 'Client' },
  ];

  for (let u of users) {
    await User.create({
      companyId: company._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      passwordHash,
      status: 'ACTIVE'
    });
  }

  console.log('Seeded successfully!');
  console.log('Login with any email (e.g., rahul@acme.com) and password: password123');
  process.exit();
};

seedData();
