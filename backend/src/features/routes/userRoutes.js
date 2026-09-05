const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { requireAuth, requireRole } = require('../../middleware/authMiddleware');

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

module.exports = router;
