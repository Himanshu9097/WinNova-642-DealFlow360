const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, // Links CUSTOMER role to their org
  name: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: false }, // Optional for OAuth users
  googleId: String,
  githubId: String,
  role: { type: String, required: true, default: 'COMPANY_ADMIN' },
  department: String,
  avatar: String,
  status: { type: String, default: 'ACTIVE' },
  invitationTokenHash: String,
  invitationExpiresAt: Date,
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);