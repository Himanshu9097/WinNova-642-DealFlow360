const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const User = require('../models/User');
const { requireAuth } = require('../../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = process.env.SESSION_SECRET || 'secret';

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

router.post('/register-company', async (req, res) => {
  try {
    const { 
      companyName, companyEmail, companyPhone, industry, website, logo,
      adminName, adminEmail, password, adminPhone
    } = req.body;

    // Check if company email already exists
    const existingCompany = await Company.findOne({ email: companyEmail });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company email already registered' });
    }

    // Check if user email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Admin email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create Company
    const company = new Company({
      name: companyName,
      email: companyEmail,
      phone: companyPhone,
      industry,
      website,
      logo
    });
    await company.save();

    // Create Admin User
    const admin = new User({
      companyId: company._id,
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'COMPANY_ADMIN',
      department: 'Administration',
      phone: adminPhone
    });
    await admin.save();

    const token = generateToken(admin._id);

    res.status(201).json({
      message: 'Company and Admin created successfully',
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, status: 'ACTIVE' });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department,
        avatar: req.user.avatar,
        status: req.user.status
      },
      company: {
        id: company._id,
        name: company.name,
        logo: company.logo,
        currency: company.currency
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

module.exports = router;
