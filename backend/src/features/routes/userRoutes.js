const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { requireAuth, requireRole } = require('../../middleware/authMiddleware');
const { sendAdminCreatedUserEmail } = require('../../utils/mailService');

const router = express.Router();

// Get all users in the company
router.get('/', requireAuth, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const users = await User.find({ companyId: req.companyId }).select('-passwordHash -invitationTokenHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create a new user (admin only)
router.post('/', requireAuth, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const { name, email, role, department, password } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Default password logic for demo purposes - in real app use email invitation flow
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'Password123!', salt);

    const user = new User({
      companyId: req.companyId,
      name,
      email,
      role,
      department,
      passwordHash,
      status: 'ACTIVE' // Activating immediately for the hackathon
    });
    await user.save();
    
    // Remove hash from response
    const userRes = user.toObject();
    delete userRes.passwordHash;
    
    // Send email to new user
    const tempPassword = password || 'Password123!';
    sendAdminCreatedUserEmail(user.email, user.name, tempPassword).catch(err => console.error('Failed to send admin-created user email', err));

    res.status(201).json(userRes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', requireAuth, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const { name, role, department, status } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      { name, role, department, status },
      { new: true }
    ).select('-passwordHash');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Provision a portal login for an existing Customer organization
router.post('/provision-customer', requireAuth, requireRole(['COMPANY_ADMIN', 'SALES_MANAGER', 'SALES_REP']), async (req, res) => {
  try {
    const { customerId, email, password, name } = req.body;

    if (!customerId || !email || !password) {
      return res.status(400).json({ error: 'customerId, email, and password are required' });
    }

    // Check customer exists and belongs to this company
    const Customer = require('../models/Customer');
    const customer = await Customer.findOne({ _id: customerId, companyId: req.companyId });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // Check if a login already exists for this customer
    const existingLogin = await User.findOne({ customerId, role: 'CUSTOMER' });
    if (existingLogin) return res.status(400).json({ error: 'A portal login already exists for this customer' });

    // Check email not already taken
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      companyId: req.companyId,
      customerId,
      name: name || customer.contactPerson || customer.name,
      email,
      role: 'CUSTOMER',
      passwordHash,
      status: 'ACTIVE'
    });
    await user.save();

    const userRes = user.toObject();
    delete userRes.passwordHash;
    res.status(201).json(userRes);
  } catch (error) {
    console.error('Provision customer error:', error);
    res.status(500).json({ error: 'Failed to provision customer login' });
  }
});

module.exports = router;
