const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const User = require('../models/User');
const crypto = require('crypto');
const { requireAuth } = require('../../middleware/authMiddleware');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../../utils/mailService');

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

    // Send welcome email asynchronously
    sendWelcomeEmail(admin.email, admin.name).catch(err => console.error('Failed to send welcome email', err));

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
        status: req.user.status,
        customerId: req.user.customerId
      },
      company: company ? {
        id: company._id,
        name: company.name,
        logo: company.logo,
        currency: company.currency
      } : null
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// --- FORGOT PASSWORD ---
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If that email exists in our system, we have sent a reset link.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5175';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}&email=${email}`;
    
    sendPasswordResetEmail(user.email, user.name, resetUrl).catch(err => console.error('Failed to send reset email', err));

    res.json({ message: 'If that email exists in our system, we have sent a reset link.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ 
      email, 
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// --- OAUTH: GOOGLE ---
router.get('/google', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=email profile`;
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_CALLBACK_URL
      })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) return res.status(400).send('Failed to get access token');
    
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = await userResponse.json();
    if (!profile.email) return res.status(400).send('No email found in Google profile');
    
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      const company = await Company.create({
        name: `${profile.name || 'User'}'s Company`,
        email: profile.email,
        phone: 'N/A'
      });
      user = await User.create({
        companyId: company._id,
        name: profile.name || 'Google User',
        email: profile.email,
        googleId: profile.id,
        role: 'COMPANY_ADMIN'
      });
    } else if (!user.googleId) {
      user.googleId = profile.id;
      await user.save();
    }
    
    const jwtToken = generateToken(user._id);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5175';
    res.redirect(`${clientUrl}/login?token=${jwtToken}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('OAuth callback failed');
  }
});

// --- OAUTH: GITHUB ---
router.get('/github', (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=user:email`;
  res.redirect(url);
});

router.get('/github/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');
    
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL
      })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) return res.status(400).send('Failed to get access token');
    
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'DealFlow360'
      }
    });
    const profile = await userResponse.json();
    
    let email = profile.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: { 
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'DealFlow360'
        }
      });
      const emails = await emailResponse.json();
      const primary = emails.find(e => e.primary) || emails[0];
      if (primary) email = primary.email;
    }
    
    if (!email) return res.status(400).send('No email found in GitHub profile');
    const name = profile.name || profile.login || 'GitHub User';

    let user = await User.findOne({ email });
    if (!user) {
      const company = await Company.create({
        name: `${name}'s Company`,
        email: email,
        phone: 'N/A'
      });
      user = await User.create({
        companyId: company._id,
        name: name,
        email: email,
        githubId: profile.id,
        role: 'COMPANY_ADMIN'
      });
    } else if (!user.githubId) {
      user.githubId = profile.id;
      await user.save();
    }
    
    const jwtToken = generateToken(user._id);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5175';
    res.redirect(`${clientUrl}/login?token=${jwtToken}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('OAuth callback failed');
  }
});

module.exports = router;
